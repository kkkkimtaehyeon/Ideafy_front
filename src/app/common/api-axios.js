// api/axiosInstance.js
import axios from 'axios';

// const baseUrl = "http://localhost:8080/api";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const api = axios.create({
    baseURL: baseUrl,
    withCredentials: true, // 쿠키 포함 요청
});

// 응답 인터셉터
api.interceptors.response.use(
    (response) => response, // 성공 응답은 그대로 반환
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                // 401 Unauthorized: 보호 페이지에서는 로그인으로 리다이렉트,
                // 공개 페이지에서는 리다이렉트하지 않음 (무한 루프 방지)
                try {
                    const path = window.location?.pathname || '';
                    const publicPaths = ['/', '/login', '/signup', '/ideas'];
                    const isIdeasDetail = /^\/ideas\/[^/]+$/.test(path);
                    const isPublic = publicPaths.includes(path) || isIdeasDetail;
                    if (!isPublic) {
                        window.location.href = '/login';
                    }
                } catch (_) {
                    // window 접근 불가한 환경에선 조용히 무시
                }
            }
            if (error.response.status === 403) {
                alert(error.response.data.detail);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
