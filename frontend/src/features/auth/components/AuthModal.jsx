import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { IoMdClose } from 'react-icons/io';
import axiosInstance from '../../../core/api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    if (!isOpen) return null;

    const handleGoogleLogin = () => {
        window.location.href = import.meta.env.DEV ? `http://${window.location.hostname}:5000/api/auth/google` : '/api/auth/google';
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/auth/login', { email, password });
            if (response.data && response.data.token) {
                login(response.data.user);
                onClose();
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
                onClick={onClose}
            ></div>
            
            <div className="relative apple-glass-card rounded-[2.25rem] shadow-apple-lg border border-white/80 w-full max-w-md z-10 flex flex-col p-7 sm:p-8">
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/[0.05] active:scale-90 text-slate-400 hover:text-slate-800 transition-all"
                >
                    <IoMdClose size={20} />
                </button>
                
                <div className="flex flex-col items-center mt-1 mb-6">
                    <span className="text-emerald-600 font-bold text-2xl tracking-tight mb-1">FairShare</span>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Log in or sign up</h2>
                </div>

                <div className="w-full">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-3">
                            <input 
                                type="text" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address" 
                                className="w-full apple-input py-3.5 px-4 font-medium"
                                required
                            />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password" 
                                className="w-full apple-input py-3.5 px-4 font-medium"
                                required
                            />
                        </div>
                        
                        <button 
                            type="submit"
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3.5 rounded-full shadow-apple-xs hover:shadow-apple active:scale-95 transition-all mt-2"
                        >
                            Continue
                        </button>
                    </form>

                    <div className="flex items-center my-6">
                        <div className="flex-1 border-b border-black/[0.06]"></div>
                        <span className="px-3 text-xs font-semibold text-slate-400">or</span>
                        <div className="flex-1 border-b border-black/[0.06]"></div>
                    </div>

                    <div className="flex justify-center">
                        <button 
                            type="button"
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center w-12 h-12 bg-white/90 border border-black/[0.08] rounded-full hover:bg-white active:scale-90 transition-all shadow-apple-xs"
                        >
                            <FcGoogle size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
