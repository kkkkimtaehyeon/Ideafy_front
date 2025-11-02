"use client";
import {User} from "lucide-react";
import {useAuth} from "@/app/contexts/AuthContext";
import Link from "next/link";

export default function Header() {
    const {user, isLoading} = useAuth();
    return (
        <header
            className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-background-light/80 backdrop-blur-sm dark:border-slate-800/80 dark:bg-background-dark/80">
            <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
                <div className="flex items-center gap-8">
                    <Link className="flex items-center gap-3 text-slate-900 dark:text-white" href="/">
                        <div className="rounded bg-primary p-1.5 text-white">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4H10V10H14V14H20V20H4V4Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <span className="text-lg font-bold">Ideafy</span>
                    </Link>
                    <nav className="hidden items-center gap-6 md:flex">
                        {/* <a className="text-sm font-medium text-slate-600 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary" href="/">Home</a> */}
                        <Link className="text-sm font-bold text-primary" href="/">Explore</Link>
                        <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary"
                           href="/ideas/new">Post Your Idea</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    {/* <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600 transition-colors hover:bg-primary/20 hover:text-primary dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-primary/20 dark:hover:text-primary">
            <span className="material-symbols-outlined text-xl">search</span>
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600 transition-colors hover:bg-primary/20 hover:text-primary dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-primary/20 dark:hover:text-primary">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button> */}
                    {isLoading ? null : (
                        user ? (
                            <a href="/me">
                                <div
                                    className="w-12 h-12 sm:w-12 sm:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                    <User className="w-8 h-8 sm:w-8 sm:h-8 text-gray-300 dark:text-gray-200"/>
                                </div>
                            </a>
                        ) : (
                            <a
                                href="/login"
                                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                            >
                                Login
                            </a>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}
