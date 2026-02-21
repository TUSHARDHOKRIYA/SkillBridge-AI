"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DashboardStage } from "./Sidebar";

interface DashboardContentProps {
    currentStage: DashboardStage;
    children: React.ReactNode;
}

export const DashboardContent = ({ currentStage, children }: DashboardContentProps) => {
    return (
        <main className="flex-1 min-h-screen bg-zinc-50 dark:bg-black overflow-y-auto">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="p-10 max-w-6xl mx-auto"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </main>
    );
};
