import { useState } from 'react';
import Header from '../core/components/Header';
import AuthModal from '../features/auth/components/AuthModal';

const WelcomePage = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50/60 relative">
            <Header onLoginClick={() => setIsAuthModalOpen(true)} />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <div className="h-64 apple-glass-card border border-white/80 rounded-[2.25rem] shadow-apple-sm animate-pulse"></div>
                    <div className="h-64 apple-glass-card border border-white/80 rounded-[2.25rem] shadow-apple-sm animate-pulse"></div>
                    <div className="h-64 apple-glass-card border border-white/80 rounded-[2.25rem] shadow-apple-sm animate-pulse"></div>
                    <div className="h-64 apple-glass-card border border-white/80 rounded-[2.25rem] shadow-apple-sm animate-pulse"></div>
                </div>
            </main>

            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
            />
        </div>
    );
};

export default WelcomePage;
