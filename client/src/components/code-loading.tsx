import { motion } from "framer-motion";

export interface CodeLoadingProps {
  isLoading: boolean;
  text?: string;
}

export function CodeLoading({ isLoading, text }: CodeLoadingProps) {
  if (!isLoading) return null;
  
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        {/* Minimalistic loading animation */}
        <div className="mb-4">
          <svg 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16"
          >
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              className="text-violet-500"
              fill="transparent"
              animate={{ 
                strokeDasharray: [0, 251],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.path
              d="M50 30L50 70M30 50L70 50"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              className="text-amber-400"
              animate={{ 
                rotate: [0, 180, 360],
                opacity: [1, 0.6, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </svg>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {text || "Converting your code..."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}