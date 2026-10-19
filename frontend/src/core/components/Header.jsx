import { Link } from 'react-router-dom';

const Header = ({ onLoginClick }) => {
    return (
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 apple-glass-nav border-b border-black/[0.06] transition-all">
            <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 active:scale-95 transition-transform">
                <div className="flex items-center justify-center w-7 h-7 bg-slate-950 text-white rounded-lg shadow-apple-xs">
                    <span className="text-sm font-bold">→</span>
                </div>
                <span>FairShare</span>
            </Link>
            
            <button 
                type="button"
                onClick={onLoginClick}
                className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-full hover:bg-black/[0.04] active:scale-95 transition-all shadow-apple-xs border border-black/[0.06] bg-white/70"
            >
                Sign up
            </button>
        </header>
    );
};

export default Header;
