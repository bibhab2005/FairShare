import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import { SplitSquareVertical } from 'lucide-react';
import ProfileDropdown from '../../features/auth/components/ProfileDropdown';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <div className="sticky top-0" style={{ zIndex: 9999 }}>
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
            <div className="flex items-center gap-4">
              <ProfileDropdown 
                name={user.name} 
                email={user.email} 
                avatarUrl={user.avatar || user.picture} 
              />
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default Navbar;
