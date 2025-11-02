"use client";

import Header from "@/components/Header";
import IdeaCard from "@/components/IdeaCard";
import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import api from "@/app/common/api-axios";


export default function Home() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [ideas, setIdeas] = useState();
    const [categories, setCategories] = useState();
    const [pagination, setPagination] = useState();

    const currentPage = parseInt(searchParams.get('page')) || 0;
    const selectedCategory = searchParams.get('category') || 'All';

    const getCategories = () => {
        api.get("/idea-categories")
            .then(res => {
                setCategories(res.data);
            })
            .catch(err => {
                console.log(err);
            })
    }
    const getIdeas = (page = 0, category = 'All') => {
        let url = `/ideas?page=${page}&size=16`;
        if (category && category !== 'All') {
            url += `&category=${encodeURIComponent(category.toUpperCase())}`;
        }

        api.get(url)
            .then(res => {
                const pageData = res.data;
                setIdeas(pageData.content);
                const paginationData = {
                    totalPages: pageData.totalPages,
                    currentPage: pageData.number,
                    totalElements: pageData.totalElements,
                    first: pageData.first,
                    last: pageData.last
                };
                setPagination(paginationData);
            })
            .catch(err => {
                console.log(err);
            })
    }

    useEffect(() => {
        getCategories();
        getIdeas(currentPage, selectedCategory);
    }, [currentPage, selectedCategory]);

    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header/>
            <main className="w-full flex-1">
                <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Explore
                            Ideas</h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">Discover, validate, and support the next
                            big thing from our community.</p>
                    </div>
                    <div className="mb-6 flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => {
                                const params = new URLSearchParams(searchParams);
                                params.delete('category'); // All일 때는 category 쿼리스트링 제거
                                params.set('page', '0');
                                const queryString = params.toString();
                                router.push(queryString ? `?${queryString}` : '/');
                            }}
                            className={`cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium shadow-sm ${
                                selectedCategory === 'All'
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-200 text-slate-700 transition-colors hover:bg-primary/20 hover:text-primary dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-primary/20 dark:hover:text-primary'
                            }`}
                        >
                            All
                        </button>
                        {categories && categories.map((category, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams);
                                    params.set('category', category.toUpperCase()); // 대문자로 변환
                                    params.set('page', '0');
                                    router.push(`?${params.toString()}`);
                                }}
                                className={`cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                    selectedCategory === category
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-slate-200 text-slate-700 hover:bg-primary/20 hover:text-primary dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-primary/20 dark:hover:text-primary'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {ideas && ideas.map((idea, index) => (
                            <IdeaCard key={index} idea={idea}/>
                        ))}
                    </div>
                    <div className="mt-8 flex items-center justify-center gap-2">
                        <button
                            onClick={() => {
                                const params = new URLSearchParams(searchParams);
                                params.set('page', Math.max(0, currentPage - 1).toString());
                                router.push(`?${params.toString()}`);
                            }}
                            disabled={pagination?.first}
                            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Prev
                        </button>
                        {pagination && pagination.totalPages > 0 && Array.from({length: pagination.totalPages}, (_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams);
                                    params.set('page', i.toString());
                                    router.push(`?${params.toString()}`);
                                }}
                                className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm ${
                                    i === pagination.currentPage
                                        ? 'bg-primary text-white'
                                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                const params = new URLSearchParams(searchParams);
                                params.set('page', Math.min(pagination?.totalPages - 1, currentPage + 1).toString());
                                router.push(`?${params.toString()}`);
                            }}
                            disabled={pagination?.last}
                            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
