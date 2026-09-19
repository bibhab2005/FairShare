import { Settings } from 'lucide-react';

const ProfileHeader = ({ name = "Bibhab Talukdar", email = "bibhab@example.com" }) => {
  return (
    <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 shadow-sm flex items-center justify-between mb-8">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-semibold">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-neutral-950">{name}</h2>
          <p className="text-sm text-neutral-500">{email}</p>
        </div>
      </div>
      <button className="p-3 text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors outline-none">
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ProfileHeader;
