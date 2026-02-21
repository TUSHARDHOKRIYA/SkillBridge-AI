"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/features/auth/AuthContext";
import { useRouter } from "next/navigation";

export default function SyllabusUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const { user } = useAuth();
    const router = useRouter();

    const [uploadStage, setUploadStage] = useState<"idle" | "uploading" | "extracting" | "mapping" | "finalizing">("idle");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== "application/pdf") {
                setError("Please upload a PDF file");
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError("File size exceeds 10MB limit");
                return;
            }
            setFile(selectedFile);
            setError("");
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError("");
        setUploadStage("uploading");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = await user?.getIdToken();

            // Real upload stage
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/syllabus/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                // Simulate processing stages for UX (since backend is currently synchronous/fast mock)
                setUploadStage("extracting");
                await new Promise(r => setTimeout(r, 1500));
                setUploadStage("mapping");
                await new Promise(r => setTimeout(r, 1500));
                setUploadStage("finalizing");
                await new Promise(r => setTimeout(r, 1000));

                router.push("/roadmap");
            } else {
                const data = await response.json();
                setError(data.detail || "Upload failed");
                setUploadStage("idle");
            }
        } catch {
            setError("An error occurred during upload");
            setUploadStage("idle");
        } finally {
            setUploading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                        Upload Your Syllabus
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                        We&apos;ll analyze your curriculum to find gaps and tailor your roadmap.
                    </p>

                    <div className="bg-white dark:bg-zinc-900 p-10 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 text-center relative overflow-hidden">
                        {uploadStage !== "idle" && (
                            <div className="absolute inset-0 bg-white/90 dark:bg-zinc-900/90 z-10 flex flex-col items-center justify-center p-8">
                                <div className="w-full max-w-xs space-y-6">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                                        <span className={uploadStage === "uploading" ? "text-blue-600" : "text-zinc-400"}>Uploading</span>
                                        <span className={uploadStage === "extracting" ? "text-blue-600" : "text-zinc-400"}>Extracting</span>
                                        <span className={uploadStage === "mapping" ? "text-blue-600" : "text-zinc-400"}>Mapping</span>
                                    </div>
                                    <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 transition-all duration-500 ease-out"
                                            style={{
                                                width:
                                                    uploadStage === "uploading" ? "25%" :
                                                        uploadStage === "extracting" ? "50%" :
                                                            uploadStage === "mapping" ? "75%" : "100%"
                                            }}
                                        />
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 animate-pulse font-medium">
                                        {uploadStage === "uploading" && "Sending file to secure storage..."}
                                        {uploadStage === "extracting" && "AI is identifying key topics and modules..."}
                                        {uploadStage === "mapping" && "Matching syllabus to industry standards..."}
                                        {uploadStage === "finalizing" && "Finalizing your personalized roadmap..."}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="text-5xl mb-4">📄</div>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                            {file ? file.name : "Select a PDF file"}
                        </h2>
                        <p className="text-sm text-zinc-500 mb-6">
                            Max file size: 10MB • Format: PDF
                        </p>

                        <input
                            type="file"
                            id="syllabus-upload"
                            className="hidden"
                            accept=".pdf"
                            onChange={handleFileChange}
                        />

                        {!file ? (
                            <label
                                htmlFor="syllabus-upload"
                                className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-bold cursor-pointer hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                            >
                                Browse Files
                            </label>
                        ) : (
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                                >
                                    Analyze Syllabus
                                </button>
                                <button
                                    onClick={() => setFile(null)}
                                    className="px-8 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    Change
                                </button>
                            </div>
                        )}

                        {error && <p className="mt-4 text-sm text-red-500 font-medium">❌ {error}</p>}
                    </div>

                    <button
                        onClick={() => router.push("/roadmap")}
                        className="mt-8 w-full py-4 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-bold transition-colors"
                    >
                        Skip for now (I don&apos;t have a syllabus) →
                    </button>
                </div>
            </div>
        </ProtectedRoute>
    );
}
