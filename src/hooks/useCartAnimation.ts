
import { useState, useCallback } from 'react';
import { Product } from '@/types';

export const useCartAnimation = () => {
  const [animatingProduct, setAnimatingProduct] = useState<Product | null>(null);
  const [startPosition, setStartPosition] = useState<{ x: number; y: number } | null>(null);
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldAnimateCart, setShouldAnimateCart] = useState(false);

  const triggerAnimation = useCallback((
    product: Product,
    start: { x: number; y: number },
    target: { x: number; y: number }
  ) => {
    setAnimatingProduct(product);
    setStartPosition(start);
    setTargetPosition(target);
    setIsAnimating(true);
    setShouldAnimateCart(true);
  }, []);

  const resetAnimation = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setAnimatingProduct(null);
      setStartPosition(null);
      setTargetPosition(null);
      setShouldAnimateCart(false);
    }, 100);
  }, []);

  return {
    animatingProduct,
    startPosition,
    targetPosition,
    isAnimating,
    shouldAnimateCart,
    triggerAnimation,
    resetAnimation
  };
};
