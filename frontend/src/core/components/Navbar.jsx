import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import { SplitSquareVertical } from 'lucide-react';
import ProfileDropdown from '../../features/auth/components/ProfileDropdown';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
            <SplitSquareVertical size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
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
  );
};

export default Navbar;
