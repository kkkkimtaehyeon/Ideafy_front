// "use client";
// import Header from "@/components/Header";
// import api from "@/app/common/api-axios";
// import {useEffect, useState} from "react";
// import {User} from "lucide-react";
// import { useAuth } from "@/app/contexts/AuthContext";


// export default function MyPage() {

//     const [user, setUser] = useState({});
//     const [ideas, setIdeas] = useState([]);
//     const [userLoading, setUserLoading] = useState(true);
//     const [ideasLoading, setIdeasLoading] = useState(true);
//     const {logout} = useAuth();

//     useEffect(() => {
//         getUserData();
//         getUserIdeas();
//     }, []);

//     const getUserData = async () => {
//         try {
//             const response = await api.get('/users/me');
//             setUser(response.data);
//         } catch (error) {
//             console.error("Error fetching user data:", error);
//         } finally {
//             setUserLoading(false);
//         }
//     };

//     const getUserIdeas = async () => {
//         try {
//             const response = await api.get('/ideas/me');
//             setIdeas(response.data.content);
//         } catch (error) {
//             console.error("Error fetching user ideas:", error);
//         } finally {
//             setIdeasLoading(false);
//         }
//     }


//     return (
//         <div
//             className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
//             <Header/>
//             <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 <div className="flex flex-col lg:flex-row gap-8">
//                     <div className="w-full lg:w-3/4 space-y-8">
//                         <section className="bg-background-light dark:bg-gray-900/50 p-6 rounded-xl shadow-sm">
//                             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
//                                 <div
//                                     className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
//                                     <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 dark:text-gray-300"/>
//                                 </div>
//                                 <div>
//                                     {userLoading ? (
//                                         <p>Loading...</p>
//                                     ) : (
//                                         <div className="flex-grow">
//                                             <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
//                                                 {user.username} </h2>
//                                             <p>{user.introduction}</p>
//                                         </div>
//                                     )}
//                                 </div>

//                             </div>
//                         </section>

//                         <section>
//                             <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">My Ideas</h3>
//                             <div
//                                 className="bg-background-light dark:bg-gray-900/50 rounded-xl shadow-sm overflow-hidden">
//                                 <div className="overflow-x-auto">
//                                     <table className="w-full text-sm text-left">
//                                         <thead
//                                             className="bg-gray-100 dark:bg-gray-800/50 text-xs text-gray-700 dark:text-gray-400 uppercase tracking-wider">
//                                         <tr>
//                                             <th scope="col" className="px-6 py-3">Title</th>
//                                             <th scope="col" className="px-6 py-3">Date</th>
//                                             <th scope="col" className="px-6 py-3 text-center">Comments</th>
//                                             <th scope="col" className="px-6 py-3 text-center">Views</th>
//                                             <th scope="col" className="px-6 py-3 text-center">Likes</th>
//                                         </tr>
//                                         </thead>

//                                         <tbody>
//                                         {ideasLoading ? (
//                                             <tr>
//                                                 <td colSpan="5"
//                                                     className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
//                                                     Loading...
//                                                 </td>
//                                             </tr>
//                                         ) : ideas?.length === 0 ? (
//                                             <tr>
//                                                 <td colSpan="5"
//                                                     className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
//                                                     No ideas found.
//                                                 </td>
//                                             </tr>
//                                         ) : (
//                                             ideas?.map((row, i) => (
//                                                 <tr key={i}
//                                                     className="cursor-pointer border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
//                                                     onClick={() => window.location.href = `/ideas/${row.id}`}
//                                                 >
//                                                     <th scope="row"
//                                                         className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
//                                                         {row.title}
//                                                     </th>
//                                                     <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
//                                                         {new Date(row.createdAt).toISOString().split('T')[0]}
//                                                     </td>
//                                                     <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-center">{row.commentCount}</td>
//                                                     <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-center">{row.viewCount}</td>
//                                                     <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-center">{row.likeCount}</td>
//                                                 </tr>
//                                             ))
//                                         )}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </div>
//                         </section>


//                     </div>

//                     <div className="w-full lg:w-1/4 space-y-6">
//                         <section className="bg-background-light dark:bg-gray-900/50 p-6 rounded-xl shadow-sm">
//                             <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account</h3>
//                             <button
//                                 onClick={async () => {
//                                     logout()
//                                 }}
//                                 className="w-full inline-flex items-center justify-center rounded-md bg-red-600 text-white px-4 py-2 font-medium hover:bg-red-700"
//                             >
//                                 Logout
//                             </button>
//                         </section>
//                     </div>

//                 </div>
//             </main>
//         </div>
//     );
// }


"use client";
import Header from "@/components/Header";
import api from "@/app/common/api-axios";
import {useEffect, useState} from "react";
import {User} from "lucide-react";
import {useAuth} from "@/app/contexts/AuthContext"; // 👈 AuthContext 훅

export default function MyPage() {
    // 1. [제거] 로컬 user, userLoading 상태를 제거합니다.
    // const [user, setUser] = useState({});
    // const [userLoading, setUserLoading] = useState(true);

    // 2. [유지] ideas 관련 상태는 MyPage에서 관리하는 것이 맞습니다.
    const [ideas, setIdeas] = useState([]);
    const [ideasLoading, setIdeasLoading] = useState(true);

    // 3. [수정] useAuth 훅에서 user, isLoading, logout을 모두 가져옵니다.
    // isLoading을 userLoading으로 별칭(alias)을 주어 기존 JSX 코드를 재사용합니다.
    const {user, isLoading: userLoading, logout} = useAuth();

    useEffect(() => {
        // 4. [제거] getUserData() 호출을 제거합니다.
        // getUserData();
        getUserIdeas();
    }, []); // useEffect의 의존성 배열은 비워둡니다.

    // 5. [제거] getUserData 함수 전체를 제거합니다.
    // const getUserData = async () => { ... };

    const getUserIdeas = async () => {
        try {
            const response = await api.get('/ideas/me');
            setIdeas(response.data.content);
        } catch (error) {
            console.error("Error fetching user ideas:", error);
        } finally {
            setIdeasLoading(false);
        }
    }

    // 6. [추가] user가 로드되지 않았을 때(예: AuthProvider가 아직 로딩 중일 때)
    // userLoading이 true일 것이고, 그때 user는 null일 수 있습니다.
    // user 객체가 null일 경우를 대비해 JSX 렌더링 부분을 방어적으로 수정합니다.
    // (기존 코드는 userLoading ? <p>Loading...</p> : (...) 으로 이미 잘 처리되어 있습니다.)

    return (
        <div
            className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
            <Header/>
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-3/4 space-y-8">
                        <section className="bg-background-light dark:bg-gray-900/50 p-6 rounded-xl shadow-sm">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <div
                                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                    <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 dark:text-gray-300"/>
                                </div>
                                <div>
                                    {/* 이 로직은 이제 Context의 isLoading 값을 사용합니다. */}
                                    {userLoading ? (
                                        <p>Loading...</p>
                                    ) : (
                                        <div className="flex-grow">
                                            {/* user가 null이 아닐 때만 username과 introduction을 표시합니다. */}
                                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                                {user?.username}
                                            </h2>
                                            <p>{user?.introduction}</p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">My Ideas</h3>
                            <div
                                className="bg-background-light dark:bg-gray-900/50 rounded-xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead
                                            className="bg-gray-100 dark:bg-gray-800/50 text-xs text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Title</th>
                                            <th scope="col" className="px-6 py-3">Date</th>
                                            <th scope="col" className="px-6 py-3 text-center">Comments</th>
                                            <th scope="col" className="px-6 py-3 text-center">Views</th>
                                            <th scope="col" className="px-6 py-3 text-center">Likes</th>
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {ideasLoading ? (
                                            <tr>
                                                <td colSpan="5"
                                                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                    Loading...
                                                </td>
                                            </tr>
                                        ) : ideas?.length === 0 ? (
                                            <tr>
                                                <td colSpan="5"
                                                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                    No ideas found.
                                                </td>
                                            </tr>
                                        ) : (
                                            ideas?.map((row, i) => (
                                                <tr key={i}
                                                    className="cursor-pointer border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                                    onClick={() => window.location.href = `/ideas/${row.id}`}
                                                >
                                                    <th scope="row"
                                                        className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                        {row.title}
                                                    </th>
                                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                        {new Date(row.createdAt).toISOString().split('T')[0]}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-center">{row.commentCount}</td>
                                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-center">{row.viewCount}</td>
                                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-center">{row.likeCount}</td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>


                    </div>

                    <div className="w-full lg:w-1/4 space-y-6">
                        <section className="bg-background-light dark:bg-gray-900/50 p-6 rounded-xl shadow-sm">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account</h3>
                            <button
                                onClick={async () => {
                                    // 이 logout 함수는 이제 AuthContext의 함수입니다.
                                    logout()
                                }}
                                className="w-full inline-flex items-center justify-center rounded-md bg-red-600 text-white px-4 py-2 font-medium hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
}
