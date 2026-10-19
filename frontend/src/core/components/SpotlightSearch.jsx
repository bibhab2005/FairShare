import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderPlus, User, History, LayoutDashboard, ArrowRight, X, Command, Users } from 'lucide-react';
import { fetchGroups } from '../../features/groups/api/groupService';

const SpotlightSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      // Fetch user groups to index them
      fetchGroups()
        .then((res) => {
          setGroups(res.data?.groups || []);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const quickActions = [
    { id: 'act-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, path: '/dashboard', type: 'action' },
    { id: 'act-new-group', label: 'Create New Group', icon: FolderPlus, path: '/dashboard?action=new-group', type: 'action' },
    { id: 'act-profile', label: 'My Profile & UPI QR', icon: User, path: '/profile', type: 'action' },
    { id: 'act-settlements', label: 'Settlement History', icon: History, path: '/settlements', type: 'action' },
  ];

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(query.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredActions = quickActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const allResults = [
    ...filteredGroups.map((g) => ({ ...g, type: 'group' })),
    ...filteredActions,
  ];

  const handleSelect = (item) => {
    if (!item) return;
    onClose();
    if (item.type === 'group') {
      navigate(`/groups/${item._id}`);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (allResults.length > 0 ? (prev + 1) % allResults.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (allResults.length > 0 ? (prev - 1 + allResults.length) % allResults.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        handleSelect(allResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-xl apple-glass-card rounded-[2rem] border border-white/80 shadow-apple-lg overflow-hidden z-10"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-5 py-4 border-b border-black/[0.06]">
              <Search size={20} className="text-slate-400 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search groups, actions, shortcuts..."
                className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-base sm:text-lg font-medium focus:outline-none"
              />
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-black/[0.04] rounded-md border border-black/[0.06]">
                  ESC
                </span>
                <button
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-black/[0.04]"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {allResults.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm font-medium">No results found for "{query}"</p>
                </div>
              ) : (
                <>
                  {filteredGroups.length > 0 && (
                    <div>
                      <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Groups ({filteredGroups.length})
                      </p>
                      {filteredGroups.map((g, idx) => {
                        const itemIndex = idx;
                        const isSelected = selectedIndex === itemIndex;
                        return (
                          <div
                            key={g._id}
                            onClick={() => handleSelect(g)}
                            onMouseEnter={() => setSelectedIndex(itemIndex)}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-apple-xs'
                                : 'text-slate-700 hover:bg-black/[0.04]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                <Users size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">{g.name}</p>
                                <p
                                  className={`text-xs truncate ${
                                    isSelected ? 'text-white/80' : 'text-slate-400'
                                  }`}
                                >
                                  {g.members?.length || 0} members {g.isArchived ? '· Archived' : ''}
                                </p>
                              </div>
                            </div>
                            <ArrowRight
                              size={15}
                              className={`shrink-0 ml-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {filteredActions.length > 0 && (
                    <div className={filteredGroups.length > 0 ? 'mt-3 pt-2 border-t border-black/[0.05]' : ''}>
                      <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Quick Shortcuts
                      </p>
                      {filteredActions.map((act, idx) => {
                        const itemIndex = filteredGroups.length + idx;
                        const isSelected = selectedIndex === itemIndex;
                        const Icon = act.icon;
                        return (
                          <div
                            key={act.id}
                            onClick={() => handleSelect(act)}
                            onMouseEnter={() => setSelectedIndex(itemIndex)}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-apple-xs'
                                : 'text-slate-700 hover:bg-black/[0.04]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                <Icon size={16} />
                              </div>
                              <span className="font-semibold text-sm">{act.label}</span>
                            </div>
                            <ArrowRight
                              size={15}
                              className={`shrink-0 ml-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer with Hint */}
            <div className="px-4 py-2.5 bg-black/[0.02] border-t border-black/[0.04] flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Use ↑ ↓ to navigate</span>
              <span className="flex items-center gap-1">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-black/[0.08] text-[10px] shadow-sm">↵</kbd>
                <span>to select</span>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SpotlightSearch;
