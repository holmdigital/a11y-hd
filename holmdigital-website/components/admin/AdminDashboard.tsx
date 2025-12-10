import React, { useState } from 'react';
import { useBlog } from '../../context/BlogContext';
import { BlogPost } from '../../types';
import { Button } from '@holmdigital/components';
import { Plus, Edit2, Trash2, LogOut } from 'lucide-react';
import { PostEditor } from './PostEditor';

export const AdminDashboard: React.FC = () => {
    const { posts, logout, createPost, updatePost, deletePost } = useBlog();
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [editingPost, setEditingPost] = useState<BlogPost | undefined>(undefined);

    const handleCreate = (data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
        createPost(data);
        setView('list');
    };

    const handleUpdate = (data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingPost) {
            updatePost(editingPost.id, data);
            setView('list');
            setEditingPost(undefined);
        }
    };

    const startEdit = (post: BlogPost) => {
        setEditingPost(post);
        setView('edit');
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            deletePost(id);
        }
    };

    if (view === 'create') {
        return (
            <PostEditor
                onSave={handleCreate}
                onCancel={() => setView('list')}
            />
        );
    }

    if (view === 'edit' && editingPost) {
        return (
            <PostEditor
                post={editingPost}
                onSave={handleUpdate}
                onCancel={() => { setView('list'); setEditingPost(undefined); }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <div className="flex gap-2">
                    <Button onClick={() => setView('create')}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Post
                    </Button>
                    <Button variant="secondary" onClick={logout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                    No posts yet. Create your first one!
                                </td>
                            </tr>
                        ) : (
                            posts.map(post => (
                                <tr key={post.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">{post.title}</div>
                                        <div className="text-sm text-slate-500">/{post.slug}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => startEdit(post)}
                                                className="text-primary-600 hover:text-primary-900 p-1"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
