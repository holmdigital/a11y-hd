import React, { useState } from 'react';
import { useBlog } from '../../context/BlogContext';
import { Button } from '@holmdigital/components';
import { Lock } from 'lucide-react';

interface AdminLoginProps {
    onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useBlog();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(password)) {
            onLoginSuccess();
        } else {
            setError('Invalid password');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md border border-slate-200">
            <div className="flex flex-col items-center mb-6">
                <div className="bg-primary-100 p-3 rounded-full mb-4">
                    <Lock className="h-6 w-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Admin Login</h2>
                <p className="text-slate-600">Enter password to manage blog posts</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter password..."
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
                )}

                <Button type="submit" className="w-full justify-center">
                    Login
                </Button>
            </form>
        </div>
    );
};
