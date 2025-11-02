"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/common/api-axios";
import { useAuth } from "@/app/contexts/AuthContext";
import Header from "@/components/Header";

export default function SignupPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [username, setUsername] = useState("");
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
        if (password !== passwordConfirm) {
            setError("Passwords do not match.");
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            const signUpData = {
                "email": email,
                "password": password,
                "username": username
            }

            await api.post("/auth/signUp", signUpData, {
                headers: { "Content-Type": "application/json" },
            });

            router.replace("/login");
        } catch (err) {
            const message = err?.response?.data?.message || "Failed to sign up.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
            <Header/>
            <div className="flex-1 flex items-center justify-center py-10 px-4">
                <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                <h1 className="text-2xl font-semibold mb-6">Sign Up</h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm mb-1" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1" htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your display name"
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
                            placeholder="Enter your password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1" htmlFor="passwordConfirm">Confirm Password</label>
                        <input
                            id="passwordConfirm"
                            type="password"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            required
                            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Re-enter your password"
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
                        {submitting ? "Signing up..." : "Sign Up"}
                    </button>
                </form>

                <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">
                    Already have an account?{" "}
                    <button
                        onClick={() => router.push("/login")}
                        className="text-indigo-600 hover:underline"
                    >
                        Log In
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
}
