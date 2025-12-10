import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BlogPost } from '../types';

interface BlogContextType {
    posts: BlogPost[];
    isAdmin: boolean;
    login: (password: string) => boolean;
    logout: () => void;
    createPost: (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updatePost: (id: string, post: Partial<BlogPost>) => void;
    deletePost: (id: string) => void;
    getPostBySlug: (slug: string) => BlogPost | undefined;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const useBlog = () => {
    const context = useContext(BlogContext);
    if (!context) {
        throw new Error('useBlog must be used within a BlogProvider');
    }
    return context;
};

interface BlogProviderProps {
    children: ReactNode;
}

export const BlogProvider: React.FC<BlogProviderProps> = ({ children }) => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    // Load from localStorage on mount
    useEffect(() => {
        const storedPosts = localStorage.getItem('hd_blog_posts');
        const storedAuth = localStorage.getItem('hd_blog_auth');

        if (storedPosts) {
            try {
                setPosts(JSON.parse(storedPosts));
            } catch (e) {
                console.error('Failed to parse blog posts', e);
            }
        } else {
            // Add a dummy post if empty
            const initialPost: BlogPost = {
                id: '1',
                title: 'Välkommen till bloggen',
                slug: 'valkommen',
                excerpt: 'Detta är det första inlägget på Holm Digital-bloggen.',
                content: '# Välkommen!\n\nHär kommer jag att skriva om digital tillgänglighet, webbutveckling och SEO.\n\nStay tuned!',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setPosts([initialPost]);
            localStorage.setItem('hd_blog_posts', JSON.stringify([initialPost]));
        }

        if (storedAuth === 'true') {
            setIsAdmin(true);
        }
    }, []);

    // Sync to localStorage
    useEffect(() => {
        if (posts.length > 0) {
            localStorage.setItem('hd_blog_posts', JSON.stringify(posts));
        }
    }, [posts]);

    const login = (password: string) => {
        // Hardcoded simple password for demo
        if (password === 'admin123' || password === 'demo') {
            setIsAdmin(true);
            localStorage.setItem('hd_blog_auth', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAdmin(false);
        localStorage.removeItem('hd_blog_auth');
    };

    const createPost = (data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newPost: BlogPost = {
            ...data,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setPosts(prev => [newPost, ...prev]);
    };

    const updatePost = (id: string, data: Partial<BlogPost>) => {
        setPosts(prev => prev.map(post =>
            post.id === id
                ? { ...post, ...data, updatedAt: new Date().toISOString() }
                : post
        ));
    };

    const deletePost = (id: string) => {
        setPosts(prev => prev.filter(post => post.id !== id));
    };

    const getPostBySlug = (slug: string) => {
        return posts.find(p => p.slug === slug);
    };

    return (
        <BlogContext.Provider value={{ posts, isAdmin, login, logout, createPost, updatePost, deletePost, getPostBySlug }}>
            {children}
        </BlogContext.Provider>
    );
};
