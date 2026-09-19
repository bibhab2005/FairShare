import { useState, useRef, useEffect } from 'react';
import { Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = ({ name = "Bibhab Talukdar", email = "bibhabtalukdar2005@gmail.com", avatarUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-neutral-50 p-2 pr-3 rounded-full transition-colors outline-none"
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={name} 
            className="w-9 h-9 rounded-full object-cover border border-neutral-200" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-neutral-700 hidden sm:block">{name}</span>
        <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-100 rounded-2xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-neutral-50 mb-1 flex items-center gap-3">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={name} 
                className="w-10 h-10 rounded-full object-cover border border-neutral-200" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg font-semibold shrink-0">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-neutral-900 truncate">{name}</p>
              <p className="text-xs text-neutral-500 truncate mt-0.5">{email}</p>
            </div>
          </div>
          
          <div className="px-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors outline-none mb-1">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
          
          <div className="px-2 border-t border-neutral-50 pt-1">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors outline-none"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
