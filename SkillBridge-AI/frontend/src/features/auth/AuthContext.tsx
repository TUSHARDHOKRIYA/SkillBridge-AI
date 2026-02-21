"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    User,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Create or update user profile document in Firestore right after login */
async function syncUserToFirestore(user: User) {
    try {
        const token = await user.getIdToken();
        await fetch(`${API_URL}/api/v1/users/me`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
    } catch (e) {
        console.warn("[Auth] Could not sync user to Firestore:", e);
    }
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    loginWithEmail: (email: string, pass: string) => Promise<void>;
    signupWithEmail: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        if (!auth) {
            alert("Firebase is not configured. Please check your .env.local file.");
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await syncUserToFirestore(result.user);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const loginWithEmail = async (email: string, pass: string) => {
        if (!auth) {
            alert("Firebase is not configured. Please check your .env.local file.");
            return;
        }
        try {
            const result = await signInWithEmailAndPassword(auth, email, pass);
            await syncUserToFirestore(result.user);
        } catch (error) {
            console.error("Error signing in with email", error);
            throw error;
        }
    };

    const signupWithEmail = async (email: string, pass: string) => {
        if (!auth) {
            alert("Firebase is not configured. Please check your .env.local file.");
            return;
        }
        try {
            const result = await createUserWithEmailAndPassword(auth, email, pass);
            await syncUserToFirestore(result.user);
        } catch (error) {
            console.error("Error signing up with email", error);
            throw error;
        }
    };

    const logout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, signupWithEmail, logout }}>
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
