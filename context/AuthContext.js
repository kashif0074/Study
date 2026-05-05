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
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';

const ADMIN_EMAIL = "admin@studyspark.com";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAuth, setShowAuth] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    useEffect(() => {
        console.log("🔥 Auth Listener Started");

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const cleanEmail = currentUser.email ? currentUser.email.trim().toLowerCase() : "";
                const isAdminUser = cleanEmail === ADMIN_EMAIL.toLowerCase();

                console.log("📌 Auth State Changed → Email:", cleanEmail, "| isAdmin:", isAdminUser);

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

                const emailFallback = cleanEmail.split('@')[0];
                const backendName = mongoProfile.name;
                const firebaseName = currentUser.displayName;
                
                setUser(prev => {
                    const existingName = prev?.name;
                    
                    // Determine if names are generic (Student, User, or email prefix)
                    const isGeneric = (n) => !n || n === "Student" || n === "User" || n === "Loading..." || n === emailFallback;
                    
                    // Priority Order:
                    // 1. Valid name from MongoDB
                    // 2. Existing name in state (from signup/update)
                    // 3. Valid name from Firebase Profile
                    // 4. Email prefix (last resort)
                    
                    let resolvedName = "User";
                    
                    if (!isGeneric(backendName)) {
                        resolvedName = backendName;
                    } else if (!isGeneric(existingName)) {
                        resolvedName = existingName;
                    } else if (!isGeneric(firebaseName)) {
                        resolvedName = firebaseName;
                    } else {
                        resolvedName = emailFallback || "User";
                    }

                    return {
                        ...currentUser,
                        ...mongoProfile,
                        name: resolvedName,
                        uid: currentUser.uid,
                        isAdmin: isAdminUser
                    };
                });
            } else {
                console.log("👤 No user logged in");
                setUser(null);
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

        // Send Email Verification
        try {
            await sendEmailVerification(newUser);
            console.log("📧 Verification email sent");
        } catch (err) {
            console.error("❌ Verification Email Error:", err);
        }

        // Update Firebase Display Name
        await updateProfile(newUser, { displayName: name });
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

        setUser({
            ...newUser,
            name: name,
            isAdmin: isAdminUser
        });

        return newUser;
    };

    const logout = async () => {
        await signOut(auth);
    };

    const resetPassword = async (email) => {
        try {
            const cleanEmail = email.trim().toLowerCase();
            console.log("📨 Attempting to send reset email to:", cleanEmail);
            await sendPasswordResetEmail(auth, cleanEmail);
            return { success: true };
        } catch (error) {
            console.error("❌ Reset Password Error:", error.code, error.message);
            
            let message = "Failed to send reset link.";
            if (error.code === 'auth/user-not-found') {
                message = "No user found with this email address.";
            } else if (error.code === 'auth/invalid-email') {
                message = "Invalid email address format.";
            } else if (error.code === 'auth/too-many-requests') {
                message = "Too many requests. Please try again later.";
            }
            
            throw new Error(message);
        }
    };

    const toggleDarkMode = async () => {
        const newValue = !darkMode;
        setDarkMode(newValue);
        await AsyncStorage.setItem('darkMode', JSON.stringify(newValue));
    };


    const triggerAuth = () => setShowAuth(true);
    const closeAuth = () => setShowAuth(false);

    const colors = darkMode ? darkTheme : lightTheme;

    const updateUser = async (updates) => {
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
    };

    const recordActivity = async () => {
        if (!user) return;
        
        const today = new Date().toISOString().split('T')[0];
        const lastDate = user.lastActivityDate;
        
        if (lastDate === today) return; 
        
        let newStreak = user.studyStreak || 0;
        
        if (lastDate) {
            const last = new Date(lastDate);
            const current = new Date(today);
            const diffTime = Math.abs(current - last);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                newStreak += 1;
            } else if (diffDays > 1) {
                newStreak = 1;
            }
        } else {
            newStreak = 1;
        }
        
        await updateUser({ 
            studyStreak: newStreak, 
            lastActivityDate: today 
        });
    };

    const addStudyTime = async (minutes) => {
        if (!user) return;
        const currentHours = user.studyTime || 0;
        const hoursToAdd = minutes / 60;
        const newTotalHours = parseFloat((currentHours + hoursToAdd).toFixed(2));
        
        await updateUser({ studyTime: newTotalHours });
    };

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
            isAdmin: user?.isAdmin || false,
            updateUser,
            resetPassword,
            recordActivity,
            addStudyTime
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);