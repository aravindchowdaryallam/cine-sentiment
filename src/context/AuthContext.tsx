import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Define User Interface
export interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    // Load user from local storage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('cineSentiment_currentUser');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to parse user:', e);
            }
        }
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            const users = JSON.parse(localStorage.getItem('cineSentiment_users') || '[]');
            const foundUser = users.find((u: any) => u.email === email && u.password === password);

            if (foundUser) {
                const userData: User = {
                    id: foundUser.id,
                    email: foundUser.email,
                    name: foundUser.name
                };
                setUser(userData);
                localStorage.setItem('cineSentiment_currentUser', JSON.stringify(userData));
                return true;
            }
        } catch (e) {
            console.error('Login error:', e);
        }
        return false;
    };

    const register = async (name: string, email: string, password: string): Promise<boolean> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            const users = JSON.parse(localStorage.getItem('cineSentiment_users') || '[]');

            // Check if user exists
            if (users.some((u: any) => u.email === email)) {
                return false; // Email already taken
            }

            // Create new user
            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password // Storing plaintext locally for simulation only
            };

            users.push(newUser);
            localStorage.setItem('cineSentiment_users', JSON.stringify(users));

            // Auto-login
            const userData: User = {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name
            };
            setUser(userData);
            localStorage.setItem('cineSentiment_currentUser', JSON.stringify(userData));

            return true;
        } catch (e) {
            console.error('Register error:', e);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('cineSentiment_currentUser');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
