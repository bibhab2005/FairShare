import { Users, Calendar, Trash2 } from 'lucide-react';

const GroupCard = ({
  groupName,
  members,
  date,
  status,
  statusType,
  imageUrl,
  onDelete,
  isCreator,
}) => {
  const displayImage = imageUrl || `https://picsum.photos/seed/${groupName}/800/500`;

  const getStatusStyles = () => {
    if (statusType === 'owe') return 'bg-rose-500/90 border-white/30 text-white shadow-apple-xs';
    if (statusType === 'owed') return 'bg-emerald-500/90 border-white/30 text-white shadow-apple-xs';
    return 'bg-black/50 border-white/20 text-white shadow-apple-xs';
  };

  return (
    <div className="relative w-full h-64 rounded-[2rem] overflow-hidden group cursor-pointer shadow-apple hover:shadow-apple-lg hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 block border border-black/[0.08] select-none">
      <img
        src={displayImage}
        alt={groupName}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/30 to-black/85 transition-opacity duration-300 group-hover:opacity-95" />

      <div className="relative h-full p-6 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <div className={`px-3.5 py-1.5 rounded-full backdrop-blur-xl text-xs font-semibold border ${getStatusStyles()}`}>
            {status}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-white mb-2 capitalize tracking-tight truncate drop-shadow-sm">
            {groupName}
          </h3>
          <div className="flex items-center gap-4 text-white/90 text-sm font-medium">
            <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <Users className="w-3.5 h-3.5" />
              {members} {members === 1 ? 'member' : 'members'}
            </span>
            <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <Calendar className="w-3.5 h-3.5" />
              {date}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
