import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { logoutUser } from '../api/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleTokenAndFetchUser = async () => {
            // Clean the token from the URL if it exists (from OAuth redirect)
            if (window.location.search.includes('token=')) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            try {
                // Let the browser send the httpOnly cookie automatically
                const response = await fetch(import.meta.env.DEV ? 'http://localhost:5000/api/auth/me' : '/api/auth/me', {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth fetch error:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        handleTokenAndFetchUser();
    }, []);

    const login = useCallback((userData) => {
        setUser(userData);
    }, []);

    const logout = useCallback(async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};
