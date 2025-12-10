import React from 'react';
import { useBlog } from '../../context/BlogContext';
import { ArrowRight, Calendar } from 'lucide-react';

interface LatestPostsProps {
    onNavigate: (slug: string) => void;
}

export const LatestPosts: React.FC<LatestPostsProps> = ({ onNavigate }) => {
    const { posts } = useBlog();
    const recentPosts = posts.slice(0, 3); // Show top 3

    if (recentPosts.length === 0) return null;

    return (
        <section className="mt-24 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Senaste från bloggen</h2>
                <button
                    onClick={() => onNavigate('blog')}
                    className="text-sm font-bold text-black hover:text-black hover:underline"
                    style={{ color: '#000000' }}
                >
                    Visa alla inlägg →
                </button>
            </div>

            <div className="space-y-8">
                {recentPosts.map(post => (
                    <article key={post.id} className="flex flex-col group">
                        <div className="flex items-center text-sm text-slate-500 mb-2">
                            <Calendar className="h-3 w-3 mr-2" />
                            <time dateTime={post.createdAt}>
                                {new Date(post.createdAt).toLocaleDateString('sv-SE', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </time>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                            <button onClick={() => onNavigate(post.slug)} className="text-left">
                                {post.title}
                            </button>
                        </h3>
                        <p className="text-slate-600 mb-3 line-clamp-2">
                            {post.excerpt}
                        </p>
                        <div>
                            <button
                                onClick={() => onNavigate(post.slug)}
                                className="text-sm font-bold text-black hover:text-black inline-flex items-center"
                                style={{ color: '#000000' }}
                            >
                                Läs mer <ArrowRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};
