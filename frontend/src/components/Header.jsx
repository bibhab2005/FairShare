import { Link } from 'react-router-dom';

const Header = ({ onLoginClick }) => {
    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <div className="flex items-center justify-center w-6 h-6 bg-black text-white rounded-md">
                    <span className="text-sm font-bold">→</span>
                </div>
                FairShare
            </Link>
            
            <button 
                type="button"
                onClick={onLoginClick}
                className="text-sm font-semibold text-gray-700 hover:text-black px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
            >
                Sign up
            </button>
        </header>
    );
};

export default Header;
