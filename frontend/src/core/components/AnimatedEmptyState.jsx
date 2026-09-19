import Lottie from 'lottie-react';
import { motion } from 'framer-motion';

const AnimatedEmptyState = ({ animationData, title, description, actionButton }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-neutral-50 rounded-[2.5rem] p-16 flex flex-col items-center gap-6 text-center"
    >
      <div className="w-32 h-32 mb-2">
        <Lottie 
          animationData={animationData} 
          loop={true} 
          autoplay={true} 
        />
      </div>
      <div>
        <p className="text-xl font-medium text-neutral-950 tracking-tight">{title}</p>
        <p className="text-neutral-500 mt-2">{description}</p>
      </div>
      {actionButton && (
        <div className="mt-4">
          {actionButton}
        </div>
      )}
    </motion.div>
  );
};

export default AnimatedEmptyState;
