import Lottie from 'lottie-react';
import { motion } from 'framer-motion';

const AnimatedEmptyState = ({ animationData, title, description, actionButton }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="apple-glass-card border border-white/80 rounded-[2.25rem] p-12 sm:p-16 flex flex-col items-center gap-6 text-center shadow-apple-sm"
    >
      <div className="w-32 h-32 mb-2">
        <Lottie 
          animationData={animationData} 
          loop={true} 
          autoplay={true} 
        />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-900 tracking-tight">{title}</p>
        <p className="text-slate-500 font-medium text-sm mt-1.5 max-w-sm">{description}</p>
      </div>
      {actionButton && (
        <div className="mt-2">
          {actionButton}
        </div>
      )}
    </motion.div>
  );
};

export default AnimatedEmptyState;
