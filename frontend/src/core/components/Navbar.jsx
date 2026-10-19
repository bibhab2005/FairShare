import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import { SplitSquareVertical, Search } from 'lucide-react';
import ProfileDropdown from '../../features/auth/components/ProfileDropdown';
import SpotlightSearch from './SpotlightSearch';

const Navbar = () => {
  const { user } = useAuth();
  const [showSpotlight, setShowSpotlight] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSpotlight((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="sticky top-0 z-30">
      <header className="w-full apple-glass-nav transition-all">
        <div className="w-full px-6 sm:px-10 lg:px-12 h-20 sm:h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3.5 group select-none">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-apple-sm group-hover:scale-105 group-active:scale-95 transition-transform duration-200">
              <SplitSquareVertical size={24} className="text-white" />
            </div>
            <span className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
              FairShare
            </span>
          </Link>

          {user && (
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                id="spotlight-search-trigger"
                onClick={() => setShowSpotlight(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-black/[0.04] hover:bg-black/[0.07] border border-black/[0.06] text-slate-500 text-xs sm:text-sm font-medium transition-all active:scale-95"
                title="Search (⌘K)"
              >
                <Search size={16} className="text-slate-400" />
                <span className="hidden md:inline text-slate-500">Search or jump to...</span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white rounded border border-black/[0.06] shadow-apple-xs">
                  ⌘K
                </span>
              </button>
              <ProfileDropdown 
                name={user.name} 
                email={user.email} 
                avatarUrl={user.avatar || user.picture} 
              />
            </div>
          )}
        </div>
      </header>

      {user && (
        <SpotlightSearch
          isOpen={showSpotlight}
          onClose={() => setShowSpotlight(false)}
        />
      )}
    </div>
  );
};

export default Navbar;

