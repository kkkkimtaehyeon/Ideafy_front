"use client";

import {useState} from "react";
import Image from "next/image";

export default function ImageCarousel({items}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const active = items?.[activeIndex] ?? null;

    if (!items || items.length === 0) return null;

    return (
        <div className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
            <div className="relative h-96">
                {active && (
                    <>
                        <Image
                            alt={active.title || 'Attachment'}
                            src={active.src}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 800px"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6">
                            {active.title && (
                                <h3 className="text-xl font-bold text-white break-words">{active.title}</h3>
                            )}
                            {active.description && (
                                <p className="mt-1 text-slate-300 whitespace-pre-wrap break-words max-h-28 overflow-auto pr-2">
                                    {active.description}
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <button
                    onClick={() => setActiveIndex((activeIndex - 1 + items.length) % items.length)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
                    aria-label="Previous"
                >
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <button
                    onClick={() => setActiveIndex((activeIndex + 1) % items.length)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
                    aria-label="Next"
                >
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
                {items.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`h-2 w-2 rounded-full transition ${activeIndex === index ? "bg-white" : "bg-white/40 hover:bg-white/80"}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}


