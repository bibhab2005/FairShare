import { Users, Calendar } from 'lucide-react';

const GroupCard = ({
  groupName,
  members,
  date,
  status,
  statusType,
  imageUrl
}) => {
  const displayImage = imageUrl || `https://picsum.photos/seed/${groupName}/800/500`;

  const getStatusStyles = () => {
    if (statusType === 'owe') return 'bg-red-500/80 border-red-500/50 text-white';
    if (statusType === 'owed') return 'bg-emerald-500/80 border-emerald-500/50 text-white';
    return 'bg-black/40 border-white/10 text-white';
  };

  return (
    <div className="relative w-full h-64 rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 block border border-neutral-100">
      <img
        src={displayImage}
        alt={groupName}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/90 transition-opacity duration-300 group-hover:opacity-90" />

      <div className="relative h-full p-6 flex flex-col justify-between z-10">
        <div className="flex justify-end items-start">
          <div className={`px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-medium border shadow-sm ${getStatusStyles()}`}>
            {status}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-white mb-3 capitalize tracking-wide truncate">
            {groupName}
          </h3>
          <div className="flex items-center gap-5 text-white/80 text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {members} {members === 1 ? 'member' : 'members'}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {date}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
