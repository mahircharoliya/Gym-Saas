"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

interface Tenant {
    id: string;
    name: string;
    slug: string;
}

interface AuthState {
    user: User | null;
    tenant: Tenant | null;
    token: string | null;
    loading: boolean;
}

interface AuthContextType extends AuthState {
    login: (token: string, user: User, tenant: Tenant) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [state, setState] = useState<AuthState>({
        user: null,
        tenant: null,
        token: null,
        loading: true,
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        const tenant = localStorage.getItem("tenant");

        if (token && user && tenant) {
            // Restore cookie in case it expired
            document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setState({
                token,
                user: JSON.parse(user),
                tenant: JSON.parse(tenant),
                loading: false,
            });
        } else {
            setState((s) => ({ ...s, loading: false }));
        }
    }, []);

    function login(token: string, user: User, tenant: Tenant) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("tenant", JSON.stringify(tenant));
        // Also set cookie so proxy can read it
        document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        setState({ token, user, tenant, loading: false });
    } 

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("tenant");
        // Clear cookie
        document.cookie = "token=; path=/; max-age=0";
        setState({ token: null, user: null, tenant: null, loading: false });
        router.push("/login");
    }

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

