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
        window.location.href = import.meta.env.DEV ? 'http://localhost:5000/api/auth/google' : '/api/auth/google';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>
            
            <div className="relative bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10 flex flex-col p-6">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <IoMdClose size={20} />
                </button>
                
                <div className="flex flex-col items-center mt-2 mb-6">
                    <span className="text-rose-500 font-bold text-2xl tracking-tight mb-2">FairShare</span>
                    <h2 className="text-xl font-semibold text-gray-900">Log in or sign up</h2>
                </div>

                <div className="w-full">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-rose-500">
                            <input 
                                type="text" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Phone number or email" 
                                className="w-full p-3.5 border-b border-gray-300 focus:outline-none"
                            />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password" 
                                className="w-full p-3.5 focus:outline-none"
                            />
                        </div>
                        
                        <button 
                            type="submit"
                            className="w-full bg-rose-500 hover:bg-rose-600 text-slate-900 font-semibold py-3.5 rounded-lg transition-colors"
                        >
                            Continue
                        </button>
                    </form>

                    <div className="flex items-center my-6">
                        <div className="flex-1 border-b border-gray-300"></div>
                        <span className="px-4 text-sm text-gray-500">or</span>
                        <div className="flex-1 border-b border-gray-300"></div>
                    </div>

                    <div className="flex justify-center">
                        <button 
                            type="button"
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center w-14 h-14 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
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
