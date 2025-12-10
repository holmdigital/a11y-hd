import React, { useState, useEffect } from 'react';
import { BlogPost } from '../../types';
import { Button } from '@holmdigital/components';
import { Save, X } from 'lucide-react';

interface PostEditorProps {
    post?: BlogPost; // If undefined, we are creating a new post
    onSave: (data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
}

export const PostEditor: React.FC<PostEditorProps> = ({ post, onSave, onCancel }) => {
    const [title, setTitle] = useState(post?.title || '');
    const [slug, setSlug] = useState(post?.slug || '');
    const [excerpt, setExcerpt] = useState(post?.excerpt || '');
    const [content, setContent] = useState(post?.content || '');

    // Auto-generate slug from title if creating new
    useEffect(() => {
        if (!post && title) {
            setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
        }
    }, [title, post]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, slug, excerpt, content });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                    {post ? 'Edit Post' : 'Create New Post'}
                </h2>
                <Button variant="ghost" onClick={onCancel} size="small">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
                        <input
                            type="text"
                            required
                            value={slug}
                            onChange={e => setSlug(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Excerpt</label>
                    <p className="text-xs text-slate-500 mb-2">Short summary for list views.</p>
                    <textarea
                        required
                        rows={2}
                        value={excerpt}
                        onChange={e => setExcerpt(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Content (Markdown)</label>
                    <textarea
                        required
                        rows={15}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
                    />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Save Post
                    </Button>
                </div>
            </form>
        </div>
    );
};
