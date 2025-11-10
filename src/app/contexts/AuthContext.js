"use client";

import {createContext, useContext, useState, useEffect} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import api from '../common/api-axios';

// 1. Context 생성
const AuthContext = createContext(null);

// 2. Provider 컴포넌트 생성
export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname(); // 👈 3. 현재 URL 경로를 가져옵니다.
    const router = useRouter();

    const logout = async () => {
        try {
            const response = await api.post("/auth/logout");
            setUser(null);
            window.location.href = '/';
        } catch (error) {
            console.log('failed to logout');
        }
    }

    const refreshUser = async () => {
        try {
            const response = await api.get('/users/me');
            setUser(response.data);
        } catch (error) {
            setUser(null);
        }
    };

    // 공개 경로 판별 함수: "/", "/login", "/signup", "/ideas", "/ideas/{id}"
    const isPublicPath = (path) => {
        if (!path) return true;
        if (path === '/' || path === '/login' || path === '/signup' || path === '/ideas') return true;
        if (/^\/ideas\/[^/]+$/.test(path)) return true; // /ideas/{id}
        return false;
    };

    useEffect(() => {
        // 모든 경로에서 사용자 정보는 조회하여 헤더 등 전역 UI가 로그인 상태를 반영하도록 함
        const fetchUser = async () => {
            try {
                const response = await api.get('/users/me'); // 👈 **이 부분이 님의 백엔드와 통신하는 곳입니다.**

                // 성공 시: user 상태에 사용자 정보를 저장합니다.
                setUser(response.data);
            } catch (error) {
                // 실패(401, 403 등) 시: user는 null로 유지됩니다 (로그인 안 됨)
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [pathname]); // 👈 6. pathname이 변경될 때마다 이 effect를 재실행합니다.

    // 인증 필요 경로에서 비로그인 상태면 로그인 페이지로 이동
    useEffect(() => {
        if (isLoading) return;
        if (!isPublicPath(pathname) && !user) {
            router.replace('/login');
        }
    }, [isLoading, user, pathname, router]);

    const value = {user, setUser, isLoading, logout, refreshUser};

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// 3. `useAuth` 커스텀 훅 생성
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    // 이 훅을 호출하면 { user, isLoading } 객체를 반환합니다.
    return context;
};

