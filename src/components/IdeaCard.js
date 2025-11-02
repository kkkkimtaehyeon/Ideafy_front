import Image from "next/image";

export default function IdeaCard({idea}) {
    const {id, title, description, category, thumbnailUrl, likeCount, commentCount, viewCount} = idea;

    return (
        <a href={`/ideas/${id ?? encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}`}
           className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-background-light shadow-sm transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-primary/50">
            <div className="relative overflow-hidden">
                {thumbnailUrl ? (
                    <Image
                        alt={title}
                        className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={thumbnailUrl}
                        width={400}
                        height={225}
                    />
                ) : (
                    <div
                        className="aspect-video w-full flex items-center justify-center bg-gray-200 text-gray-500 text-lg">
                        {title}
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                {/* <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary backdrop-blur-sm dark:bg-primary/30">
          {category}
        </span> */}
                <span
                    className="absolute top-3 left-3 inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
          {category}
        </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
                <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                    {title}
                </h3>
                <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
                <div
                    className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">favorite</span>
                        <span>{likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">comment</span>
                        <span>{commentCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">visibility</span>
                        <span>{viewCount}</span>
                    </div>
                </div>
            </div>
        </a>
    );
}
