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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  if (!tourData || !tourData.steps) return null;

  const step = tourData.steps[index];
  const isLast = index === tourData.steps.length - 1;
  const progress = ((index + 1) / tourData.steps.length) * 100;

  useEffect(() => {
    localStorage.setItem('tour_progress', index.toString());
  }, [index]);

  useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!step || isMobile) return; 

    const updatePosition = () => {
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

  // --- STYLES (Fixed: No x/y here) ---
  const desktopStyle = {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    width: '320px',
    borderRadius: '16px',
  };

  const mobileStyle = {
    position: 'fixed' as const,
    left: '16px',
    right: '16px',
    bottom: '24px',
    width: 'auto',
    borderRadius: '20px',
    transform: 'none', 
  };

  return (
    <>
      <style>{`
        .btn { 
          cursor: pointer; border: none; padding: 12px 16px; border-radius: 10px; 
          font-weight: 600; font-size: 14px; transition: all 0.2s; 
          display: inline-flex; justify-content: center; align-items: center;
        }
        .btn-primary { background: #0f172a; color: white; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2); }
        .btn-primary:active { transform: scale(0.98); }
        
        .btn-back { background: transparent; color: #64748b; }
        .btn-back:hover { background: #f1f5f9; color: #334155; }
        
        .btn-skip { background: transparent; color: #94a3b8; font-size: 13px; margin-right: auto; }
        .btn-skip:hover { color: #64748b; }

        .progress-track { 
          width: 100%; height: 4px; background: #f1f5f9; border-radius: 2px; 
          margin-bottom: 20px; overflow: hidden; 
        }
        .progress-fill { 
          height: 100%; background: #3b82f6; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
        }

        h3 { margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #1e293b; }
        p { margin: 0 0 24px; color: #475569; line-height: 1.6; font-size: 15px; }

        /* Mobile specific adjustments to make buttons fit */
        @media (max-width: 480px) {
          .btn { padding: 12px 10px; font-size: 13px; } 
          /* Ensure Skip doesn't get squashed */
          .btn-skip { margin-right: 10px; font-size: 12px; }
        }
      `}</style>
      
      <AnimatePresence mode='wait'>
        <motion.div 
          id="tour-card"
          // Animation Logic
          initial={ isMobile ? { y: 100, opacity: 0 } : { opacity: 0, scale: 0.95 } }
          animate={{ 
            opacity: 1, 
            scale: 1, 
            // 1. We switch the layout mode
            ...(isMobile ? mobileStyle : desktopStyle),
            // 2. We handle Coordinates here (Solving the red flag!)
            x: isMobile ? 0 : coords.x,
            y: isMobile ? 0 : coords.y,
          }}
          exit={ isMobile ? { y: 100, opacity: 0 } : { opacity: 0, scale: 0.95 } }
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          style={{ 
            background: 'rgba(255, 255, 255, 0.98)', 
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: '#333', 
            padding: '24px',
            boxShadow: '0 20px 60px -12px rgba(0,0,0,0.25), 0 0 1px rgba(0,0,0,0.1)',
            fontFamily: 'Inter, -apple-system, sans-serif', 
            zIndex: 999999,
            border: '1px solid rgba(0,0,0,0.05)',
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
              {/* Skip Button is now ALWAYS visible, even on mobile */}
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