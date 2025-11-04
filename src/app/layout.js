import {Inter} from "next/font/google";
import "./globals.css";
import {AuthProvider} from "@/app/contexts/AuthContext";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata = {
    title: "Ideafyy",
    description: "Discover, validate, and support the next big thing from our community.",
    icons: {
        icon: "/myfavicon.ico",
    }
};

export default function RootLayout({children}) {
    return (
        <html lang="en" className="dark">
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap"
                rel="stylesheet"
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
                rel="stylesheet"
            />
        </head>
        <body
            className={`${inter.variable} font-display bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200`}
        >
        <AuthProvider>
            {children}
        </AuthProvider>
        </body>
        </html>
    );
}
