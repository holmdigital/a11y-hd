import React, { useEffect } from 'react';
import { useBlog } from '../../context/BlogContext';
import { Button } from '@holmdigital/components';
import { ArrowLeft, Calendar, User } from 'lucide-react';

interface BlogPostViewProps {
    slug: string;
    onBack: () => void;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({ slug, onBack }) => {
    const { getPostBySlug } = useBlog();
    const post = getPostBySlug(slug);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!post) {
        return (
            <div className="max-w-3xl mx-auto py-20 px-4 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">Inlägget hittades inte</h1>
                <Button onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Tillbaka till bloggen
                </Button>
            </div>
        );
    }

    return (
        <article className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
            <Button variant="ghost" onClick={onBack} className="mb-8 pl-0 hover:bg-transparent hover:text-primary-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Alla inlägg
            </Button>

            <header className="mb-10">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                    {post.title}
                </h1>

                <div className="flex items-center text-slate-500 text-sm border-b border-slate-200 pb-8">
                    <div className="flex items-center mr-6">
                        <Calendar className="h-4 w-4 mr-2" />
                        <time dateTime={post.createdAt}>
                            {new Date(post.createdAt).toLocaleDateString('sv-SE', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </time>
                    </div>
                    <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>Karin Holm</span>
                    </div>
                </div>
            </header>

            <div className="prose prose-slate max-w-none prose-lg">
                {/* Simple rendering preserving whitespace. In a real app, use react-markdown */}
                <div className="whitespace-pre-wrap font-serif text-slate-800 leading-relaxed">
                    {post.content}
                </div>
            </div>
        </article>
    );
};
