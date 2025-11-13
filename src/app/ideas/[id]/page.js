"use client";
import {useState, useEffect} from "react";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import Header from "@/components/Header";
import ImageCarousel from "@/components/ImageCarousel";
import api from "@/app/common/api-axios";
import {useAuth} from "@/app/contexts/AuthContext";

// 날짜 포맷팅 함수 (yyyy-mm-dd)
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function IdeaDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [idea, setIdea] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const {user} = useAuth();

    // 댓글 작성 상태
    const [newComment, setNewComment] = useState({
        content: ''
    });
    const [submittingComment, setSubmittingComment] = useState(false);

    // 대댓글 작성 상태
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    // 댓글 수정 상태
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [submittingEdit, setSubmittingEdit] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);

    const ideaOwner = idea?.user ?? null;
    const ideaOwnerName = ideaOwner?.username ?? ideaOwner?.name ?? idea?.userName ?? idea?.username ?? 'Anonymous';
    const ideaOwnerProfileImage = ideaOwner?.profileImageUrl ?? idea?.profileImageUrl ?? idea?.userProfileImageUrl ?? null;

    useEffect(() => {
        console.log("user", user);
        console.log("idea", idea);
        console.log("comments", comments);
    }, [user]);


    useEffect(() => {
        const fetchIdea = async () => {
            try {
                const response = await api.get(`/ideas/${params.id}`);
                setIdea(response.data);
            } catch (error) {
                console.error('Failed to fetch idea:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await api.get(`/ideas/${params.id}/comments`);
                setComments(response.data);
            } catch (error) {
                console.error('Failed to fetch comments:', error);
            }
        };
        if (params.id) {
            fetchIdea();
            fetchComments();
        }
    }, [params.id]);

    useEffect(() => {
        const fetchLikes = async () => {
            // user가 있고, params.id도 있어야 요청
            if (user && params.id) {
                try {
                    const response = await api.get(`/ideas/${params.id}/likes`);
                    const likeData = response.data;
                    setLikeCount(likeData.likeCount || 0);
                    setIsUserLiked(likeData.isUserLiked || false);
                } catch (error) {
                    console.error('Failed to fetch likes:', error);
                }
            } else if (!user) {
                // (선택 사항) 사용자가 로그아웃했거나 비로그인 상태일 때 좋아요 상태 초기화
                setLikeCount(idea?.likeCount || 0); // 아이디어의 기본 좋아요 수를 표시하거나 0으로 설정
                setIsUserLiked(false);
            }
        };

        fetchLikes();
    }, [params.id, user, idea]);

    // 댓글 제출 핸들러
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            router.replace('/login');
            return;
        }
        if (!newComment.content.trim()) {
            alert('Please enter a comment.');
            return;
        }

        setSubmittingComment(true);
        try {
            const response = await api.post(`/ideas/${params.id}/comments`, {
                content: newComment.content
            });

            // 댓글 목록 새로고침
            const commentsResponse = await api.get(`/ideas/${params.id}/comments`);
            setComments(commentsResponse.data);

            // 폼 초기화
            setNewComment({content: ''});
        } catch (error) {
            console.error('Failed to submit comment:', error);
            alert('Failed to submit comment.');
        } finally {
            setSubmittingComment(false);
        }
    };

    // 대댓글 제출 핸들러
    const handleReplySubmit = async (e, parentCommentId) => {
        e.preventDefault();
        if (!user) {
            router.replace('/login');
            return;
        }
        if (!replyContent.trim()) {
            alert('Please enter a comment.');
            return;
        }

        setSubmittingReply(true);
        try {
            const response = await api.post(`/ideas/${params.id}/comments`, {
                content: replyContent,
                parentCommentId: parentCommentId
            });

            // 댓글 목록 새로고침
            const commentsResponse = await api.get(`/ideas/${params.id}/comments`);
            setComments(commentsResponse.data);

            // 폼 초기화
            setReplyContent('');
            setReplyingTo(null);
        } catch (error) {
            console.error('Failed to submit reply:', error);
            alert('Failed to submit reply.');
        } finally {
            setSubmittingReply(false);
        }
    };

    // 대댓글 작성 취소
    const handleCancelReply = () => {
        setReplyContent('');
        setReplyingTo(null);
    };

    // 댓글 수정 시작
    const handleStartEdit = (comment) => {
        setEditingCommentId(comment.id);
        setEditContent(comment.content);
    };

    // 댓글 수정 취소
    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditContent('');
    };

    // 댓글 수정 제출
    const handleEditSubmit = async (commentId) => {
        if (!editContent.trim()) {
            alert('Please enter a comment.');
            return;
        }

        setSubmittingEdit(true);
        try {
            await api.put(`/comments/${commentId}`, {
                content: editContent
            });

            // 댓글 목록 새로고침
            const commentsResponse = await api.get(`/ideas/${params.id}/comments`);
            setComments(commentsResponse.data);

            // 수정 모드 종료
            setEditingCommentId(null);
            setEditContent('');
        } catch (error) {
            console.error('Failed to edit comment:', error);
            alert('Failed to edit comment.');
        } finally {
            setSubmittingEdit(false);
        }
    };

    // 댓글 삭제
    const handleDeleteComment = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        setDeletingCommentId(commentId);
        try {
            await api.delete(`/comments/${commentId}`);

            // 댓글 목록 새로고침
            const commentsResponse = await api.get(`/ideas/${params.id}/comments`);
            setComments(commentsResponse.data);
        } catch (error) {
            console.error('Failed to delete comment:', error);
            alert('Failed to delete comment.');
        } finally {
            setDeletingCommentId(null);
        }
    };

    // 좋아요 제출 핸들러
    const handleLikeSubmit = async () => {
        if (!user) {
            router.replace('/login');
            return;
        }
        setSubmittingLike(true);
        try {
            await api.post(`/ideas/${params.id}/likes`);

            // 좋아요 데이터 새로고침
            const likeResponse = await api.get(`/ideas/${params.id}/likes`);
            const likeData = likeResponse.data;
            setLikeCount(likeData.likeCount || 0);
            setIsUserLiked(likeData.isUserLiked || false);
        } catch (error) {
            console.error('Failed to submit like:', error);
            alert('Failed to submit like.');
        } finally {
            setSubmittingLike(false);
        }
    };

    // 삭제 핸들러
    const handleDelete = async () => {
        if (!user) {
            router.replace('/login');
            return;
        }

        if (!confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            await api.delete(`/ideas/${params.id}`);
            alert('Post has been deleted.');
            router.push('/');
        } catch (error) {
            console.error('Failed to delete idea:', error);
            alert('Failed to delete post.');
        }
    };

    // 평점 데이터 상태
    const [ratings, setRatings] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [submittingRating, setSubmittingRating] = useState(false);

    // 좋아요 데이터 상태
    const [likeCount, setLikeCount] = useState(0);
    const [isUserLiked, setIsUserLiked] = useState(false);
    const [submittingLike, setSubmittingLike] = useState(false);

    // 평점 통계 계산
    const calculateRatingStats = () => {
        if (!ratings || ratings.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: [0, 0, 0, 0, 0]
            };
        }

        // ratings는 이미 Integer 배열이므로 직접 사용
        const allRatings = ratings;

        if (allRatings.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: [0, 0, 0, 0, 0]
            };
        }

        // 평균 평점 계산
        const averageRating = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;

        // 평점 분포 계산 (5점부터 1점까지)
        const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
            const count = allRatings.filter(rating => rating === star).length;
            return Math.round((count / allRatings.length) * 100);
        });

        return {
            averageRating: Math.round(averageRating * 10) / 10, // 소수점 첫째 자리까지
            totalReviews: allRatings.length,
            ratingDistribution
        };
    };

    const ratingStats = calculateRatingStats();

    if (loading) {
        return (
            <div
                className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-200">
                <Header/>
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-slate-600 dark:text-slate-400">Loading idea...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!idea) {
        return (
            <div
                className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-200">
                <Header/>
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-slate-600 dark:text-slate-400">Idea not found</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div
            className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-200">
            <Header/>
            <main className="flex-1">
                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

                    <div className="mb-8">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl break-words">{idea.title}</h1>
                                <p className="mt-3 max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words">{idea.summary}</p>
                                {idea.createdAt && (
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{formatDate(idea.createdAt)}</p>
                                )}
                            </div>
                            {user && (idea.userId === user.userId) && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => router.push(`/ideas/${params.id}/edit`)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 transition-colors font-medium"
                                    >
                                        {/* <span className="material-symbols-outlined text-base">edit</span> */}
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 dark:bg-red-500/20 dark:hover:bg-red-500/30 transition-colors font-medium"
                                    >
                                        {/* <span className="material-symbols-outlined text-base">delete</span> */}
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-b border-slate-200 dark:border-slate-800">
                        <nav className="-mb-px flex space-x-6">
                            <button type="button" onClick={() => setActiveTab("overview")}
                                    className={`cursor-pointer px-1 pb-3 text-sm ${activeTab === "overview" ? "border-b-2 border-primary font-semibold text-primary" : "border-b-2 border-transparent font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-300"}`}
                                    aria-selected={activeTab === "overview"}>Overview
                            </button>
                        </nav>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <div className="space-y-12">
                                {activeTab === "overview" && idea.attachments && idea.attachments.length > 0 && (
                                    <section>
                                        <ImageCarousel items={idea.attachments.map(attachment => ({
                                            src: attachment.fileUrl,
                                            // title: attachment.description || 'Attachment',
                                            description: attachment.description
                                        }))}/>
                                    </section>
                                )}

                                {activeTab === "overview" && (
                                    <section>
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Problem</h2>
                                                <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words">
                                                    {idea.problem}
                                                </p>
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Solution</h2>
                                                <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words">
                                                    {idea.solution}
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {activeTab === "overview" && (
                                    <section>
                                        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Details</h2>
                                        <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                                            <div className="space-y-1">
                                                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Category</dt>
                                                <dd className="text-base text-slate-900 dark:text-slate-100 break-words">{idea.category}</dd>
                                            </div>
                                            <div className="space-y-1">
                                                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Stage</dt>
                                                <dd className="text-base text-slate-900 dark:text-slate-100 break-words">{idea.stage}</dd>
                                            </div>
                                            <div className="space-y-1">
                                                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Target
                                                    User
                                                </dt>
                                                <dd className="text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">{idea.targetUser}</dd>
                                            </div>
                                            {idea.revenueModel && (
                                                <div className="space-y-1">
                                                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Revenue
                                                        Model
                                                    </dt>
                                                    <dd className="text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">{idea.revenueModel}</dd>
                                                </div>
                                            )}
                                            {idea.techStacks && (
                                                <div className="space-y-1">
                                                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Tech
                                                        Stack
                                                    </dt>
                                                    <dd className="text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">{idea.techStacks}</dd>
                                                </div>
                                            )}
                                            {idea.keyMetrics && (
                                                <div className="space-y-1">
                                                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Key
                                                        Metrics
                                                    </dt>
                                                    <dd className="text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">{idea.keyMetrics}</dd>
                                                </div>
                                            )}
                                            {idea.alternatives && (
                                                <div className="space-y-1">
                                                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Alternatives</dt>
                                                    <p className="text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">{idea.alternatives}</p>
                                                </div>
                                            )}
                                            {idea.urls && Object.keys(idea.urls).length > 0 && (
                                                <div className="space-y-1 sm:col-span-2">
                                                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Related
                                                        URLs
                                                    </dt>
                                                    <dd className="text-base text-slate-900 dark:text-slate-100">
                                                        {Object.entries(idea.urls).map(([alias, url]) => (
                                                            <div key={alias} className="mb-2">
                                                                <span
                                                                    className="font-medium text-slate-700 dark:text-slate-300">{alias}: </span>
                                                                <a href={url} target="_blank" rel="noopener noreferrer"
                                                                   className="text-primary hover:underline break-all">{url}</a>
                                                            </div>
                                                        ))}
                                                    </dd>
                                                </div>
                                            )}
                                            <div className="space-y-1 sm:col-span-2">
                                                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Desired
                                                    Feedback
                                                </dt>
                                                <dd className="text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">{idea.feedback}</dd>
                                            </div>
                                        </dl>
                                    </section>
                                )}

                                {/* Provide Feedback */}
                                {activeTab === "feedback" && (
                                    <section>
                                        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Provide
                                            Feedback</h2>
                                        <div className="space-y-6">
                                            <div
                                                className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-background-dark/50">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-1">
                                                        {/* <p className="font-medium text-slate-800 dark:text-slate-200">Share your thoughts on this idea. What do you like? What could be improved?</p> */}
                                                        <p className="font-medium text-slate-800 dark:text-slate-200">{idea.feedback}</p>
                                                        <div className="mt-4 space-y-4">
                                                            <textarea
                                                                className="form-textarea w-full rounded-lg border-slate-300 bg-slate-50 p-4 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-primary"
                                                                placeholder="Provide your feedback..."
                                                                rows={4}></textarea>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <label
                                                                        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                                        <input defaultChecked
                                                                               className="form-radio h-4 w-4 border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-offset-background-dark"
                                                                               name="visibility-new" type="radio"/>
                                                                        <span
                                                                            className="material-symbols-outlined text-base">public</span>
                                                                        Public
                                                                    </label>
                                                                    <label
                                                                        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                                        <input
                                                                            className="form-radio h-4 w-4 border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-offset-background-dark"
                                                                            name="visibility-new" type="radio"/>
                                                                        <span
                                                                            className="material-symbols-outlined text-base">lock</span>
                                                                        Private
                                                                    </label>
                                                                </div>
                                                                <button
                                                                    className="cursor-pointer flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white hover:bg-primary/90">Post
                                                                    Feedback
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* Existing Feedback */}
                                {activeTab === "feedback" && (
                                    <section>
                                        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Existing
                                            Feedback</h2>
                                        <div className="space-y-6">
                                            {[
                                                {
                                                    name: "Elena Rodriguez",
                                                    time: "2 days ago",
                                                    visibility: {label: "Public", variant: "public"},
                                                    text:
                                                        '"The subscription model is a solid choice, but have you considered a tiered pricing structure? A free basic tier could significantly boost user adoption, with premium features available in paid tiers. This could attract a wider audience initially."',
                                                    avatar:
                                                        "https://lh3.googleusercontent.com/aida-public/AB6AXuCier2fuzrf6ZMFz1h4p5uGEbBHlQ0wrAB5p-dg7c40QH-zfcJQ4HfDry6NPXDTaQughbw7FA9FOkmZCyeAp6kvOuWc-vrev6PgmQ0ovJVwtD5bx0dx_WRW0fxlZvsf0JBUuEeK2mH_qHJyU0V3O3vzn1IDK_aPO63-pMsWpLjWuyEUE7gOm_Igt2JAN6dveqD9gFrU9p51AQIm-N7_3S0tHz3S6DxZfmOgo-pMn-TMhY9s3UiLccViA72-IYTygc8d0yKbuBnnaQU",
                                                },
                                                {
                                                    name: "Ben Carter",
                                                    time: "5 days ago",
                                                    visibility: {label: "Private", variant: "lock"},
                                                    text:
                                                        '"The AI personalization engine is ambitious. A potential roadblock could be the initial data required to train the models effectively. It might be worth exploring partnerships with educational institutions to access anonymized datasets. Also, ensuring data privacy will be paramount."',
                                                    avatar:
                                                        "https://lh3.googleusercontent.com/aida-public/AB6AXuB5_Qe85-lk1DycW1iMhvHzFPYHusAbsM67HfcmG6ynP28h6yjDogPQKzyRm1ihcAIy06NdlVcKMN-6V40HwgdSFgEBluhyEz__squWcg5SmCJ0jlCScrs1CIRcRfNPKFUs5oVKXMrGfjsHwYqNfmiEsn9t1scudFEGu3nvjc10HMTtv2F1Ensc0dRUy64DrqW6g03GqfheZmM0Mn7AQMqkRibxLbcrqsf4d3S1wHDxSGq9j3Yd3zGI4d-PLpWZ7SMTY_yKVHymjTk",
                                                },
                                                {
                                                    name: "Aisha Khan",
                                                    time: "1 week ago",
                                                    visibility: {label: "Public", variant: "public"},
                                                    text:
                                                        '"The key differentiator will be the quality and adaptability of the AI-driven content recommendations. If the platform can truly create a unique learning path for each student that adapts in real-time, it will be a game-changer. Competitors often have a more static approach."',
                                                    avatar:
                                                        "https://lh3.googleusercontent.com/aida-public/AB6AXuC6vmNYFPWkju5HVVX0bInzatT3dqJHAd1FHC7D_vJ0A7fSYda8RketkNtgIOGhHiY_On0A_G7h2doQxUJ-qFxG_UPNkcdBgOpWehy9U2xIbru1gLSBvHe0r_HoBJOPTfSQh-LpPrE1jUjCDUdHQMDe84Eh0DErofuitzw_XmlYg_NfM4BGEsFtZ08cauFzkZ9AykS32BG5FQOcF1WvsCq9d8UP5JlxYZvORn8z978Q3Jq-WozwNnadYBb2FevX35-O-LT4V5UmEsc",
                                                },
                                            ].map((item, i) => (
                                                <div key={i}
                                                     className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-background-dark/50">
                                                    <div className="flex items-start gap-4">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img alt="User Avatar" className="h-10 w-10 rounded-full"
                                                             src={item.avatar}/>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.time}</p>
                                                                </div>
                                                                <div
                                                                    className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${item.visibility.variant === "public" ? "bg-primary/10 text-primary dark:bg-primary/20" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                                                                    <span
                                                                        className="material-symbols-outlined text-sm">{item.visibility.variant}</span>
                                                                    <span>{item.visibility.label}</span>
                                                                </div>
                                                            </div>
                                                            <p className="mt-3 text-slate-600 dark:text-slate-300">{item.text}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {activeTab === "overview" && (
                                    <section>
                                        {/* <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Comments ({comments.length})</h2> */}
                                        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Comments</h2>
                                        {/* Comment compose */}
                                        <div
                                            className="mb-6 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-background-dark/50">
                                            <form className="space-y-4" onSubmit={handleCommentSubmit}>
                                                <div>
                                                    <label
                                                        className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                                                        htmlFor="comment">Your Comment</label>
                                                    <textarea
                                                        className="form-textarea w-full rounded-lg border-slate-300 bg-slate-50 p-4 text-base focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-primary"
                                                        id="comment"
                                                        placeholder="Share your thoughts on this idea..."
                                                        rows={4}
                                                        value={newComment.content}
                                                        onChange={(e) => setNewComment(prev => ({
                                                            ...prev,
                                                            content: e.target.value
                                                        }))}
                                                        required
                                                    ></textarea>
                                                </div>
                                                <div className="flex justify-end">
                                                    <button
                                                        type="submit"
                                                        disabled={submittingComment}
                                                        className="cursor-pointer flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {submittingComment ? 'Posting...' : 'Post Comment'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>

                                        {/* Comments List */}
                                        <div className="space-y-6">
                                            {comments.map((comment) => (
                                                <div key={comment.id} className="flex items-start gap-4">
                                                    <div
                                                        className="h-10 w-10 flex-shrink-0 rounded-full bg-cover bg-center"
                                                        style={{
                                                            backgroundImage: comment.user.profileImageUrl
                                                                ? `url(${comment.user.profileImageUrl})`
                                                                : "url(https://picsum.photos/seed/user/80/80)"
                                                        }}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{comment.user.username}</p>
                                                            {comment.createdAt && (
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(comment.createdAt)}</p>
                                                            )}
                                                        </div>
                                                        
                                                        {/* 수정 모드 */}
                                                        {editingCommentId === comment.id ? (
                                                            <div className="mt-1 space-y-3">
                                                                <textarea
                                                                    className="form-textarea w-full rounded-lg border-slate-300 bg-slate-50 p-3 text-base focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-primary"
                                                                    rows={4}
                                                                    value={editContent}
                                                                    onChange={(e) => setEditContent(e.target.value)}
                                                                    required
                                                                ></textarea>
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleCancelEdit}
                                                                        className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleEditSubmit(comment.id)}
                                                                        disabled={submittingEdit}
                                                                        className="text-sm text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        {submittingEdit ? 'Saving...' : 'Edit'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <p className="mt-1 text-base leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words">
                                                                    {comment.content}
                                                                </p>

                                                                {/* Reply button and Edit/Delete buttons */}
                                                                <div className="mt-3 flex items-center gap-4">
                                                                    <button
                                                                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                                        className="cursor-pointer flex items-center gap-1 text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
                                                                    >
                                                                        <span
                                                                            className="material-symbols-outlined text-base">reply</span>
                                                                        reply
                                                                    </button>
                                                                    {user && user.userId === comment.user.userId && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleStartEdit(comment)}
                                                                                className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
                                                                            >
                                                                                edit
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                                disabled={deletingCommentId === comment.id}
                                                                                className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            >
                                                                                {deletingCommentId === comment.id ? 'Deleting...' : 'delete'}
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}

                                                        {/* Reply form */}
                                                        {replyingTo === comment.id && (
                                                            <div
                                                                className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                                                                <form onSubmit={(e) => handleReplySubmit(e, comment.id)}
                                                                      className="space-y-4">
                                                                    <div>
                                                                        <label
                                                                            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Your
                                                                            Reply</label>
                                                                        <textarea
                                                                            className="form-textarea w-full rounded-lg border-slate-300 bg-white p-3 text-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 dark:focus:border-primary"
                                                                            placeholder="Write a reply..."
                                                                            rows={3}
                                                                            value={replyContent}
                                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                                            required
                                                                        ></textarea>
                                                                    </div>
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={handleCancelReply}
                                                                            className="flex h-8 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            type="submit"
                                                                            disabled={submittingReply}
                                                                            className="flex h-8 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        >
                                                                            {submittingReply ? 'Submitting...' : 'Submit Reply'}
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            </div>
                                                        )}

                                                        {/* 대댓글 */}
                                                        {comment.childComments && comment.childComments.length > 0 && (
                                                            <div
                                                                className="mt-4 ml-4 space-y-4 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                                                                {comment.childComments.map((childComment) => (
                                                                    <div key={childComment.id}
                                                                         className="flex items-start gap-3">
                                                                        <div
                                                                            className="h-8 w-8 flex-shrink-0 rounded-full bg-cover bg-center"
                                                                            style={{
                                                                                backgroundImage: childComment.user.profileImageUrl
                                                                                    ? `url(${childComment.user.profileImageUrl})`
                                                                                    : "url(https://picsum.photos/seed/user/60/60)"
                                                                            }}
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div
                                                                                className="flex items-center gap-2 mb-1">
                                                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{childComment.user.username}</p>
                                                                                {childComment.createdAt && (
                                                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(childComment.createdAt)}</p>
                                                                                )}
                                                                            </div>
                                                                            
                                                                            {/* 대댓글 수정 모드 */}
                                                                            {editingCommentId === childComment.id ? (
                                                                                <div className="mt-1 space-y-3">
                                                                                    <textarea
                                                                                        className="form-textarea w-full rounded-lg border-slate-300 bg-slate-50 p-3 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-primary"
                                                                                        rows={3}
                                                                                        value={editContent}
                                                                                        onChange={(e) => setEditContent(e.target.value)}
                                                                                        required
                                                                                    ></textarea>
                                                                                    <div className="flex justify-end gap-2">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={handleCancelEdit}
                                                                                            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                                                                        >
                                                                                            Cancel
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleEditSubmit(childComment.id)}
                                                                                            disabled={submittingEdit}
                                                                                            className="text-sm text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                        >
                                                                                            {submittingEdit ? 'Saving...' : 'Edit'}
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <>
                                                                                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words">
                                                                                        {childComment.content}
                                                                                    </p>
                                                                                    {user && user.userId === childComment.user.userId && (
                                                                                        <div className="mt-2 flex items-center gap-4">
                                                                                            <button
                                                                                                onClick={() => handleStartEdit(childComment)}
                                                                                                className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
                                                                                            >
                                                                                                edit
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => handleDeleteComment(childComment.id)}
                                                                                                disabled={deletingCommentId === childComment.id}
                                                                                                className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                            >
                                                                                                {deletingCommentId === childComment.id ? 'Deleting...' : 'delete'}
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>

                        

                        <aside className="space-y-8">
                            {/* 유저 프로필 */}
                            <section
                                className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-background-dark/50">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="h-14 w-14 flex-shrink-0 rounded-full bg-cover bg-center"
                                        style={{
                                            backgroundImage: `url(${idea.user.profileImageUrl})`
                                        }}
                                    />
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Idea By</p>
                                        <Link href={`/users/${idea.user.userId}`} className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{idea.user.username}</Link>
                                    </div>
                                </div>
                            </section>
 
                            {/* 좋아요, 댓글, 조회 */}
                            <section
                                className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-background-dark/50">
                                {/* <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">User Interaction</h2> */}
                                <div className="flex items-center justify-around space-x-2">
                                    <div className="flex flex-col items-center gap-1">
                                        <button
                                            onClick={handleLikeSubmit}
                                            disabled={submittingLike}
                                            className={`transition-colors ${isUserLiked ? 'text-red-500' : 'text-slate-500 dark:text-slate-400 hover:text-red-500'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                      <span className="cursor-pointer material-symbols-outlined text-2xl">
                        {isUserLiked ? 'favorite' : 'favorite_border'}
                      </span>
                                        </button>
                                        <span
                                            className="text-xs font-bold text-slate-500 dark:text-slate-400">{likeCount}</span>
                                    </div>
                                    <div
                                        className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-2xl">chat_bubble_outline</span>
                                        <span className="text-xs font-bold">{idea.commentCount}</span>
                                    </div>

                                    <div
                                        className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-base">visibility</span>
                                        <span>{idea.viewCount}</span>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}


