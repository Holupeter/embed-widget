import { useEffect, useState } from 'react';
import { computePosition, flip, shift, offset } from '@floating-ui/dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTourData } from './useTourData';

interface AppProps {
  shadowRoot: ShadowRoot;
  tourId: string;
}

export default function App({ shadowRoot, tourId }: AppProps) {
  // 1. Get Data via Hook (Mock or Real)
  const tourData = useTourData(tourId);

  // 2. Initialize State
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

  // 3. GUARD CLAUSE (Crucial)
  // We must check if data exists before trying to read 'steps'.
  // If tourData is loading or empty, we show nothing.
  if (!tourData || !tourData.steps) return null;

  // 4. DEFINE VARIABLES (Only once!)
  const step = tourData.steps[index];
  const isLast = index === tourData.steps.length - 1;
  const progress = ((index + 1) / tourData.steps.length) * 100;

  // 5. EFFECTS
  useEffect(() => {
    localStorage.setItem('tour_progress', index.toString());
  }, [index]);

  useEffect(() => {
    if (!step) return;

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
  }, [shadowRoot, index, step]); // Added 'step' to dependency array for safety

  // 6. HANDLERS
  const finishTour = () => {
    setIsVisible(false);
    localStorage.removeItem('tour_progress');
  };

  const next = () => {
    if (isLast) {
      finishTour();
    } else {
      setIndex(prev => prev + 1);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        .btn { cursor: pointer; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; transition: opacity 0.2s; }
        .btn-primary { background: #111; color: white; }
        .btn-primary:hover { opacity: 0.9; }
        .btn-back { background: transparent; color: #666; }
        .btn-back:hover { background: #f0f0f0; }
        .btn-skip { background: transparent; color: #999; font-size: 12px; margin-right: auto; }
        .btn-skip:hover { color: #666; }
        
        /* Progress Bar Styles */
        .progress-track { width: 100%; height: 4px; background: #f0f0f0; border-radius: 2px; margin-bottom: 16px; overflow: hidden; }
        .progress-fill { height: 100%; background: #2563eb; transition: width 0.3s ease; }
      `}</style>
      
      <AnimatePresence mode='wait'>
        <motion.div 
          id="tour-card"
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ 
            opacity: 1, scale: 1, y: 0,
            x: coords.x, 
            top: coords.y,
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 80, damping: 20, mass: 1 }}
          style={{ 
            position: 'absolute', left: 0, width: '320px',
            background: '#fff', color: '#333', padding: '20px',
            borderRadius: '16px', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.15)',
            fontFamily: 'system-ui, sans-serif', zIndex: 99999,
          }}
        >
          {/* PROGRESS BAR */}
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
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>{step.title}</h3>
            <p style={{ margin: '0 0 20px', color: '#666', lineHeight: 1.5, fontSize: '14px' }}>{step.description}</p>
          </motion.div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* SKIP BUTTON */}
              <button className="btn btn-skip" onClick={finishTour}>
                  Skip Tour
              </button>

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