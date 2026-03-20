import { useState, useEffect } from 'react';

export function useCountUp(endValue, duration = 1000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (endValue === undefined || endValue === null || endValue === '') return;
    const end = parseFloat(endValue);
    if (isNaN(end)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(endValue);
      return;
    }
    
    let startTime = null;
    let animationFrame;
    const isFloat = end % 1 !== 0 || String(endValue).includes('.');

    const tick = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - percentage, 4);
      const current = end * easeOut;
      
      setCount(isFloat ? parseFloat(current.toFixed(1)) : Math.floor(current));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        setCount(endValue);
      }
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [endValue, duration]);

  return count;
}
