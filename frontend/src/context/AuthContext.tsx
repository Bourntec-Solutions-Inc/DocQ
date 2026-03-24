import { createContext, useState, useContext, useEffect } from "react";
import api, { setAuthToken } from "../api/client";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const res = await api.get("auth/me/");
            setUser({ ...res.data, loggedIn: true });
        } catch (err) {
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setAuthToken(token);
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (token: string) => {
        setAuthToken(token);
        localStorage.setItem("token", token);
        await fetchProfile();
    };

    const logout = () => {
        localStorage.removeItem("token");
        setAuthToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, fetchProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
