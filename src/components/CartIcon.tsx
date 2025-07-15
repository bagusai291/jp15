
import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';

interface CartIconProps {
  className?: string;
  onAnimationTrigger?: boolean;
}

const CartIcon = ({ className = "w-6 h-6", onAnimationTrigger = false }: CartIconProps) => {
  const { itemCount } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (onAnimationTrigger && itemCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [onAnimationTrigger, itemCount]);

  return (
    <div className="relative">
      <motion.div
        animate={isAnimating ? {
          scale: [1, 1.2, 1],
          rotate: [0, -10, 10, 0]
        } : {}}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <ShoppingCart className={className} />
      </motion.div>
      
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-bounce-gentle"
            aria-label={`${itemCount} items in cart`}
          >
            {itemCount > 99 ? '99+' : itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartIcon;
