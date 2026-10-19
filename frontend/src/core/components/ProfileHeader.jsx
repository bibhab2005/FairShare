import { Settings } from 'lucide-react';

const ProfileHeader = ({ name = "Bibhab Talukdar", email = "bibhab@example.com" }) => {
  return (
    <div className="apple-card-surface border border-white/80 rounded-[2.25rem] p-6 sm:p-8 shadow-apple-sm flex items-center justify-between mb-8">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 flex items-center justify-center text-xl font-bold shadow-apple-xs">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{name}</h2>
          <p className="text-xs sm:text-sm font-medium text-slate-400">{email}</p>
        </div>
      </div>
      <button 
        aria-label="Profile Settings"
        className="p-3 text-slate-400 hover:text-slate-800 hover:bg-black/[0.04] active:scale-95 rounded-full transition-all outline-none"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ProfileHeader;
