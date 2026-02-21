"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";

export default function ExportViewPage({ searchParams }: { searchParams: { url: string } }) {
    const sheetUrl = searchParams.url;

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-8">
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-10 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 text-center">
                    <div className="text-6xl mb-6">📊</div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                        Roadmap Exported!
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                        Your personalized career roadmap has been successfully exported to Google Sheets.
                    </p>

                    <div className="space-y-4">
                        <a
                            href={sheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                        >
                            Open Google Sheet
                        </a>
                        <Link
                            href="/dashboard"
                            className="block w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
