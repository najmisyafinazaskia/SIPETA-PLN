import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
    id: string;
    name: string;
    username?: string;
    email?: string;
    photo?: string;
    phone?: string;
    unit?: string;
    lastReadNotificationsAt?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    updateUser: (userData: User) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user_data");

        if (token && storedUser) {
            setIsAuthenticated(true);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user_data", JSON.stringify(userData));
        localStorage.setItem("user_name", userData.name);
        localStorage.setItem("user_username", userData.username || "");
        localStorage.setItem("user_email", userData.email || "");
        localStorage.setItem("user_photo", userData.photo || "");

        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("user_name");
        localStorage.removeItem("user_username");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_photo");

        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = (userData: User) => {
        localStorage.setItem("user_data", JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
