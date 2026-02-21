"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/features/auth/AuthContext";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export default function OnboardingPage() {
    const { logout } = useAuth();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Onboarding</h1>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-500"
                        >
                            Logout
                        </button>
                    </div>
                    <OnboardingForm />
                </div>
            </div>
        </ProtectedRoute>
    );
}
