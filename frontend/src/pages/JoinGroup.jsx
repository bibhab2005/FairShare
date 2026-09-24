import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGroupInviteInfo, joinGroupViaLink } from '../features/groups/api/groupService';
import { Users, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Navbar from '../core/components/Navbar';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const JoinGroup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await getGroupInviteInfo(id);
        setGroupInfo(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired invite link.');
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [id]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await joinGroupViaLink(id);
      toast.success('Successfully joined the group!');
      navigate(`/groups/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join group');
      if (err.response?.status === 409) {
        // Already a member
        navigate(`/groups/${id}`);
      }
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="font-sans relative min-h-screen">
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-8 sm:p-12 text-center"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 size={40} className="text-emerald-500 animate-spin" />
                <p className="text-slate-500 font-medium">Verifying invite...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle size={40} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Invite Not Found</h2>
                  <p className="text-slate-500">{error}</p>
                </div>
                <Link
                  to="/"
                  className="mt-4 inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Return to Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center shadow-inner">
                  <Users size={48} className="text-emerald-500" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
                    You've been invited!
                  </h2>
                  <p className="text-slate-500 text-lg">
                    <span className="font-semibold text-slate-700">{groupInfo?.creatorName}</span> invited you to join <br/>
                    <span className="font-bold text-slate-900 text-xl block mt-2">"{groupInfo?.groupName}"</span>
                  </p>
                </div>

                <div className="w-full flex flex-col gap-3 mt-4">
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {joining ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={20} />
                    )}
                    {joining ? 'Joining...' : 'Accept Invite & Join'}
                  </button>
                  <Link
                    to="/"
                    className="w-full inline-flex items-center justify-center px-8 py-4 rounded-2xl font-medium text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Decline
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default JoinGroup;
