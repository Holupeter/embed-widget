import { useEffect, useState } from 'react';
import { computePosition, flip, shift, offset } from '@floating-ui/dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTourData } from './useTourData';

interface AppProps {
  shadowRoot: ShadowRoot;
  tourId: string;
}

export default function App({ shadowRoot, tourId }: AppProps) {
  const tourData = useTourData(tourId);

  const [index, setIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('tour_progress');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  
  // 1. NEW: Track if we are on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  if (!tourData || !tourData.steps) return null;

  const step = tourData.steps[index];
  const isLast = index === tourData.steps.length - 1;
  const progress = ((index + 1) / tourData.steps.length) * 100;

  useEffect(() => {
    localStorage.setItem('tour_progress', index.toString());
  }, [index]);

  useEffect(() => {
    // 2. NEW: Listen for screen resize to switch modes
    const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!step) return;

    const updatePosition = () => {
      // 3. OPTIMIZATION: If mobile, don't waste CPU calculating positions
      if (isMobile) return; 

      const target = document.querySelector(step.targetId);
      const tooltip = shadowRoot.getElementById('tour-card');

      if (target && tooltip) {
        computePosition(target, tooltip, {
          placement: 'bottom',
          middleware: [offset(20), flip(), shift({ padding: 10 })],
        }).then(({ x, y }) => {
          setCoords({ x, y });
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [shadowRoot, index, step, isMobile]);

  const finishTour = () => {
    setIsVisible(false);
    localStorage.removeItem('tour_progress');
  };

  const next = () => {
    if (isLast) finishTour();
    else setIndex(prev => prev + 1);
  };

  if (!isVisible) return null;

  // 4. DYNAMIC STYLES: Switch between "Float" and "Bottom Sheet"
  const desktopStyle = {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    x: coords.x,
    y: coords.y,
    width: '320px',
  };

  const mobileStyle = {
    position: 'fixed' as const,
    left: '50%',
    bottom: '20px',
    x: '-50%', // Centers it horizontally
    y: 0, // No vertical offset needed, it's pinned to bottom
    width: '90vw', // 90% of screen width
    maxWidth: '350px', // But never huge
  };

  return (
    <>
      <style>{`
        .btn { cursor: pointer; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; transition: opacity 0.2s; }
        .btn-primary { background: #111; color: white; }
        .btn-primary:hover { opacity: 0.9; }
        .btn-back { background: transparent; color: #666; }
        .btn-back:hover { background: #f0f0f0; }
        .btn-skip { background: transparent; color: #999; font-size: 13px; margin-right: auto; }
        .btn-skip:hover { color: #666; }
        
        .progress-track { width: 100%; height: 4px; background: #f0f0f0; border-radius: 2px; margin-bottom: 20px; overflow: hidden; }
        .progress-fill { height: 100%; background: #2563eb; transition: width 0.3s ease; }
        
        h3 { margin: 0 0 10px; font-size: 18px; fontWeight: 700; }
        p { margin: 0 0 24px; color: #666; lineHeight: 1.6; fontSize: 15px; }
      `}</style>
      
      <AnimatePresence mode='wait'>
        <motion.div 
          id="tour-card"
          // 5. ANIMATION: Adjust entrance direction based on device
          initial={{ opacity: 0, scale: 0.95, y: isMobile ? 50 : 10, x: isMobile ? '-50%' : 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            ...(isMobile ? mobileStyle : desktopStyle) // Apply the correct style object
          }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, mass: 1 }}
          style={{ 
            background: '#fff', color: '#333', padding: '24px',
            borderRadius: '20px', 
            boxShadow: '0 20px 60px -10px rgba(0,0,0,0.2)',
            fontFamily: 'Inter, system-ui, sans-serif', 
            zIndex: 99999,
          }}
        >
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>

          <motion.div
            key={index}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </motion.div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="btn btn-skip" onClick={finishTour}>Skip</button>
              <button 
                  className="btn btn-back" 
                  onClick={() => setIndex(prev => prev - 1)}
                  disabled={index === 0}
                  style={{ opacity: index === 0 ? 0 : 1, pointerEvents: index === 0 ? 'none' : 'auto' }}
              >
                  Back
              </button>
              <button className="btn btn-primary" onClick={next}>
                  {isLast ? 'Finish' : 'Next'}
              </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}