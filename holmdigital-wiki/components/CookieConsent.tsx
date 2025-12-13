import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

export const CookieConsent: React.FC = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'accepted');

        // Update Google consent
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }

        setShowBanner(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'declined');
        setShowBanner(false);
    };

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:pl-[19rem]"
                    role="dialog"
                    aria-label="Cookie consent"
                    aria-describedby="cookie-description"
                >
                    <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-xl shadow-2xl p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">🍪 Cookie Notice</h3>
                                <p id="cookie-description" className="text-slate-300 text-sm">
                                    We use cookies to analyze site traffic and improve your experience.
                                    Your data is anonymized and never shared.
                                </p>
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <button
                                    onClick={handleDecline}
                                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 rounded-lg hover:border-slate-500 transition-colors"
                                >
                                    Decline
                                </button>
                                <button
                                    onClick={handleAccept}
                                    className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                                >
                                    Accept
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
