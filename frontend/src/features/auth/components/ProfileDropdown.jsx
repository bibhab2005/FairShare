import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, LogOut, ChevronDown, Trash2, MessageSquareHeart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deleteAccount } from '../api/authService';
import ConfirmModal from '../../../core/components/ConfirmModal';
import FeedbackModal from '../../../core/components/FeedbackModal';
import ProfileSettingsModal from './ProfileSettingsModal';

const ProfileDropdown = ({ name = "Bibhab Talukdar", email = "bibhabtalukdar2005@gmail.com", avatarUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the button AND the portal menu
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        menuRef.current && !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8, // 8px mt
        right: window.innerWidth - rect.right - window.scrollX
      });
    }
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success('Your account has been permanently deleted.');
      logout();
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const dropdownMenu = isOpen ? createPortal(
    <div 
      ref={menuRef}
      className="absolute w-64 bg-white/60 backdrop-blur-lg border border-white/40 rounded-2xl shadow-lg py-2 animate-in fade-in slide-in-from-top-2 duration-200" 
      style={{ top: dropdownPos.top, right: dropdownPos.right, zIndex: 999999 }}
    >
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
          <p className="text-xs text-slate-600 truncate mt-0.5">{email}</p>
        </div>
      </div>
      
      <div className="px-2">
        <button 
          onClick={() => { setIsOpen(false); setShowSettingsModal(true); }}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors outline-none mb-1 font-medium"
        >
          <Settings className="w-4 h-4 text-emerald-500" />
          Profile Settings
        </button>
        <button 
          onClick={() => { setIsOpen(false); setShowFeedbackModal(true); }}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors outline-none mb-1 font-medium"
        >
          <MessageSquareHeart className="w-4 h-4 text-emerald-500" />
          Feedback & Ideas
        </button>
      </div>
      
      <div className="px-2 border-t border-neutral-100 pt-1">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors outline-none mb-1"
        >
          <LogOut className="w-4 h-4 text-neutral-500" />
          Logout
        </button>
        <button 
          onClick={() => { setIsOpen(false); setShowDeleteModal(true); }}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors outline-none font-medium"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
          Delete Account
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="flex items-center gap-3 hover:bg-slate-100/70 p-2 sm:p-2.5 pr-3 sm:pr-4 rounded-full transition-colors outline-none"
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={name} 
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-neutral-200" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-base font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm sm:text-base font-medium text-neutral-800 hidden sm:block">{name}</span>
        <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownMenu}

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account Permanently?"
        message="This action is permanent and cannot be undone. All your profile data, username, and group memberships will be permanently deleted."
        confirmText="Yes, Delete Permanently"
        isDestructive={true}
        isLoading={isDeleting}
      />

      <ProfileSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
};

export default ProfileDropdown;
