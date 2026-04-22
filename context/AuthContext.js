// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../constants/color';
import CONFIG from '../constants/config';
import { auth } from '../firebase/config';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';

const ADMIN_EMAIL = "admin@studyspark.com";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAuth, setShowAuth] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // Admin mode state

    useEffect(() => {
        console.log("🔥 Auth Listener Started");

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const cleanEmail = currentUser.email ? currentUser.email.trim().toLowerCase() : "";
                const isAdminUser = cleanEmail === ADMIN_EMAIL.toLowerCase();

                console.log("📌 Auth State Changed → Email:", cleanEmail, "| isAdmin:", isAdminUser);

                // Agar admin hai to automatically admin mode ON
                if (isAdminUser) {
                    setIsAdmin(true);
                    await AsyncStorage.setItem('adminMode', 'true');
                } else {
                    // Normal user ke liye saved admin mode check karo
                    const savedAdminMode = await AsyncStorage.getItem('adminMode');
                    setIsAdmin(savedAdminMode === 'true');
                }

                // Fetch MongoDB profile data to merge with Firebase user
                let mongoProfile = {};
                try {
                    const profileResp = await fetch(`${CONFIG.API_URLS.AUTH}/profile/${cleanEmail}`);
                    if (profileResp.ok) {
                        mongoProfile = await profileResp.json();
                        console.log("📊 MongoDB Profile loaded:", mongoProfile.email);
                    }
                } catch (err) {
                    console.warn("⚠️ Could not fetch MongoDB profile:", err);
                }

                setUser({
                    ...currentUser,
                    ...mongoProfile,
                    uid: currentUser.uid, // Ensure uid is preserved
                    isAdmin: isAdminUser
                });
            } else {
                console.log("👤 No user logged in");
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (emailInput, password) => {
        try {
            const email = typeof emailInput === 'string' 
                ? emailInput.trim().toLowerCase() 
                : (emailInput?.email ? emailInput.email.trim().toLowerCase() : "");

            console.log("🔑 Login attempt with clean email:", email);

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const loggedInUser = userCredential.user;

            const isAdminUser = email === ADMIN_EMAIL.toLowerCase();

            console.log("✅ Login Successful → Email:", email, "| isAdmin:", isAdminUser);

            // Agar admin hai to automatically admin mode ON
            if (isAdminUser) {
                setIsAdmin(true);
                await AsyncStorage.setItem('adminMode', 'true');
            }

            setUser({
                ...loggedInUser,
                isAdmin: isAdminUser
            });

            return { user: loggedInUser, isAdmin: isAdminUser };
        } catch (error) {
            console.error("❌ Login Error:", error.code, error.message);
            throw error;
        }
    };

    const signup = async (emailInput, password, name) => {
        const email = typeof emailInput === 'string' 
            ? emailInput.trim().toLowerCase() 
            : (emailInput?.email ? emailInput.email.trim().toLowerCase() : "");

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        const isAdminUser = email === ADMIN_EMAIL.toLowerCase();

        // Sync with MongoDB backend
        try {
            await fetch(`${CONFIG.API_URLS.AUTH}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });
            console.log("✅ MongoDB User created");
        } catch (err) {
            console.error("❌ MongoDB Signup Error:", err);
        }

        // Admin signup ho to admin mode ON
        if (isAdminUser) {
            setIsAdmin(true);
            await AsyncStorage.setItem('adminMode', 'true');
        }

        setUser({
            ...newUser,
            name: name,
            isAdmin: isAdminUser
        });

        return newUser;
    };

    const logout = async () => {
        await signOut(auth);
        setIsAdmin(false);
        await AsyncStorage.removeItem('adminMode');
    };

    const toggleDarkMode = async () => {
        const newValue = !darkMode;
        setDarkMode(newValue);
        await AsyncStorage.setItem('darkMode', JSON.stringify(newValue));
    };

    const toggleAdminMode = async () => {
        const newValue = !isAdmin;
        setIsAdmin(newValue);
        await AsyncStorage.setItem('adminMode', JSON.stringify(newValue));
    };

    const triggerAuth = () => setShowAuth(true);
    const closeAuth = () => setShowAuth(false);

    const colors = darkMode ? darkTheme : lightTheme;

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            signup,
            logout,
            showAuth,
            setShowAuth,
            triggerAuth,
            closeAuth,
            darkMode,
            toggleDarkMode,
            colors,
            isAdmin,
            toggleAdminMode,
            updateUser: async (updates) => {
                const currentUser = user;
                if (!currentUser) return;

                const email = currentUser.email || currentUser.emailAddress;
                console.log("🔄 Syncing profile for:", email, "Updates:", updates);

                // Update local state first (Optimistic)
                setUser(prev => prev ? { ...prev, ...updates } : null);

                // Persist to backend
                if (email) {
                    try {
                        const response = await fetch(`${CONFIG.API_URLS.AUTH}/update-profile`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, ...updates })
                        });
                        const data = await response.json();
                        if (response.ok) {
                            console.log("💾 Persistence Sync Success:", data.message);
                        } else {
                            console.error("❌ Persistence Sync Failed:", data.message, data.error || "");
                        }
                    } catch (err) {
                        console.error("❌ Persistence Network Error:", err);
                    }
                }
            },
            recordActivity: () => console.log('Activity tracked')
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);