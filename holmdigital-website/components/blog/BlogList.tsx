import React from 'react';
import { useBlog } from '../../context/BlogContext';
import { Button } from '@holmdigital/components';
import { Calendar, ArrowRight } from 'lucide-react';

interface BlogListProps {
    onNavigate: (slug: string) => void;
}

export const BlogList: React.FC<BlogListProps> = ({ onNavigate }) => {
    const { posts } = useBlog();

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Blogg & Insikter</h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Senaste nytt om digital tillgänglighet, teknisk utveckling och SEO.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {posts.map(post => (
                    <article
                        key={post.id}
                        className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center text-sm text-slate-500 mb-4">
                                <Calendar className="h-4 w-4 mr-2" />
                                <time dateTime={post.createdAt}>
                                    {new Date(post.createdAt).toLocaleDateString('sv-SE', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </time>
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                                {post.title}
                            </h2>

                            <p className="text-slate-600 mb-6 flex-1 line-clamp-3">
                                {post.excerpt}
                            </p>

                            <div className="mt-auto">
                                <button
                                    onClick={() => onNavigate(post.slug)}
                                    className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700 hover:underline"
                                >
                                    Läs mer
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {posts.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                    <p className="text-slate-500">Inga inlägg hittades.</p>
                </div>
            )}
        </div>
    );
};
