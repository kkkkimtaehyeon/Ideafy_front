"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/common/api-axios";
import { useAuth } from "@/app/contexts/AuthContext";
import Header from "@/components/Header";

export default function LoginPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isLoading && user) {
            router.replace("/");
        }
    }, [isLoading, user, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
      
        setError("");
        setSubmitting(true);
      
        try {
          const formData = new URLSearchParams();
          formData.append("email", email);
          formData.append("password", password);
      
          await api.post("/auth/login", formData, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          });
      
          router.replace("/");
        } catch (err) {
          const message = err?.response?.data?.message || "Failed to Login";
          setError(message);
        } finally {
          setSubmitting(false);
        }
      };
      

    const redirectToProvider = (provider) => {
        // 서버에서 OAuth 시작 엔드포인트를 `/api/auth/oauth2/authorize/{provider}` 로 가정합니다.
        const base = api.defaults.baseURL?.replace(/\/$/, "") || "";
        window.location.href = `${base}/auth/oauth2/authorize/${provider}`;
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
            <Header/>
            <div className="flex-1 flex items-center justify-center py-10 px-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                <h1 className="text-2xl font-semibold mb-6">Login</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {submitting ? "Login..." : "Login"}
                    </button>
                </form>

                {/* <div className="my-6 flex items-center">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"/>
                    <span className="px-3 text-xs text-slate-500">or</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"/>
                </div> */}

                {/* <div className="grid grid-cols-1 gap-3">
                    <button
                        onClick={() => redirectToProvider("google")}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                    >
                        <span className="material-symbols-outlined text-red-500">nest_cam_wired_stand</span>
                        <span>Continue with Google</span>
                    </button>
                    <button
                        onClick={() => redirectToProvider("github")}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                    >
                        <span className="material-symbols-outlined">code</span>
                        <span>Continue with GitHub</span>
                    </button>
                </div> */}

                <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">
                No account yet?{" "}
                    <button
                        onClick={() => router.push("/signup")}
                        className="text-indigo-600 hover:underline"
                    >
                        Sign Up
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
}


