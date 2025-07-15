
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';

interface FlyingProductAnimationProps {
  product: Product | null;
  startPosition: { x: number; y: number } | null;
  targetPosition: { x: number; y: number } | null;
  isAnimating: boolean;
  onComplete: () => void;
}

const FlyingProductAnimation = ({
  product,
  startPosition,
  targetPosition,
  isAnimating,
  onComplete
}: FlyingProductAnimationProps) => {
  const animationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, onComplete]);

  if (!product || !startPosition || !targetPosition || !isAnimating) {
    return null;
  }

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          ref={animationRef}
          initial={{
            position: 'fixed',
            left: startPosition.x,
            top: startPosition.y,
            zIndex: 1000,
            scale: 1,
            opacity: 1
          }}
          animate={{
            left: targetPosition.x,
            top: targetPosition.y,
            scale: [1, 0.8, 0.3],
            opacity: [1, 0.8, 0]
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="pointer-events-none"
        >
          <div className="bg-white rounded-lg shadow-lg p-2 border">
            <img
              src={product.image_url || '/placeholder.svg'}
              alt={product.name}
              className="w-16 h-16 object-cover rounded"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FlyingProductAnimation;
