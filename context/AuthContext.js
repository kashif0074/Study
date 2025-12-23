// context/AuthContext.js (UPDATED WITH THEME SUPPORT)
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // --- AUTHENTICATION STATE ---
    const [user, setUser] = useState(null); 
    const [showAuth, setShowAuth] = useState(false); 
    const isGuest = user === null; 

    // --- THEME STATE ---
    const [darkMode, setDarkMode] = useState(false);

    // Load theme from AsyncStorage on app start
    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('darkMode');
            if (savedTheme !== null) {
                setDarkMode(JSON.parse(savedTheme));
            }
        } catch (error) {
            console.error('Failed to load theme:', error);
        }
    };

    const toggleDarkMode = async () => {
        const newValue = !darkMode;
        setDarkMode(newValue);
        try {
            await AsyncStorage.setItem('darkMode', JSON.stringify(newValue));
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    // Theme colors based on darkMode state
    const colors = darkMode 
        ? {
            // Dark theme colors
            background: '#0F172A',
            card: '#1E293B',
            text: '#F1F5F9',
            subText: '#94A3B8',
            border: '#334155',
            primary: '#6B21A8',
            secondary: '#8B5CF6',
            danger: '#EF4444',
            success: '#10B981',
            warning: '#F59E0B',
            info: '#0EA5E9',
            lightText: '#F8FAFC',
            darkText: '#1E293B',
        }
        : {
            // Light theme colors
            background: '#FAF5FF',
            card: '#FFFFFF',
            text: '#1E293B',
            subText: '#64748B',
            border: '#E2E8F0',
            primary: '#6B21A8',
            secondary: '#8B5CF6',
            danger: '#EF4444',
            success: '#10B981',
            warning: '#F59E0B',
            info: '#0EA5E9',
            lightText: '#F8FAFC',
            darkText: '#1E293B',
        };

    // --- AUTH FUNCTIONS ---
    const login = (userData) => {
        setUser(userData); 
        setShowAuth(false);
    };

    const logout = () => {
        setUser(null); 
    };
    
    const triggerAuth = () => {
        if (isGuest) {
            setShowAuth(true);
        }
    }

    const closeAuth = () => {
        setShowAuth(false);
    }

    return (
        <AuthContext.Provider 
            value={{ 
                // Auth State
                user, 
                isGuest, 
                login, 
                logout, 
                showAuth, 
                setShowAuth,
                closeAuth,
                triggerAuth,
                
                // Theme State
                darkMode,
                toggleDarkMode,
                colors,
                
                // Combined theme object for convenience
                theme: {
                    darkMode,
                    colors,
                    toggleDarkMode,
                }
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};