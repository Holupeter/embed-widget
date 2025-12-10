import { useEffect, useState } from 'react';
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTourData } from './useTourData';

interface AppProps {
  shadowRoot: ShadowRoot;
  tourId: string;
}

export default function App({ shadowRoot, tourId }: AppProps) {
  const tourData = useTourData(tourId);

  // --- STATE ---
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
  const [targetRect, setTargetRect] = useState({ top: 0, left: 0, width: 0, height: 0 });

  // Guard Clause
  if (!tourData || !tourData.steps) return null;

  const step = tourData.steps[index];
  const isLast = index === tourData.steps.length - 1;
  const progress = ((index + 1) / tourData.steps.length) * 100;

  useEffect(() => {
    localStorage.setItem('tour_progress', index.toString());
  }, [index]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- ENGINE ---
  useEffect(() => {
    if (!step) return;

    const target = document.querySelector(step.targetId);
    
    // 1. SCROLL TO TARGET (Center it on screen)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 2. CALCULATE POSITION & SPOTLIGHT SIZE
    const updateCalculations = () => {
      if (!target) return;

      // Get dimensions for the Spotlight
      const rect = target.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });

      // Calculate Desktop Tooltip Position (Only if NOT mobile)
      if (!isMobile) {
        const tooltip = shadowRoot.getElementById('tour-card');
        if (tooltip) {
          computePosition(target, tooltip, {
            placement: 'bottom',
            middleware: [
                offset(20), 
                flip({ fallbackPlacements: ['top', 'right', 'left'] }), 
                shift({ padding: 20 })
            ],
          }).then(({ x, y }) => {
            setCoords({ x, y });
          });
        }
      }
    };

    let cleanup: () => void;
    if (target) {
        cleanup = autoUpdate(target, document.body, updateCalculations);
    }
    
    return () => {
        if (cleanup) cleanup();
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

  // --- STYLES ---

  // 1. SPOTLIGHT (The Dark Overlay)
  // pointerEvents: 'none' ensures clicks pass through the dark area to the page if needed,
  // BUT the shadow covers the page.
  const spotlightStyle = {
    position: 'fixed' as const,
    top: targetRect.top,
    left: targetRect.left,
    width: targetRect.width,
    height: targetRect.height,
    borderRadius: '8px',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)', // The "Dark Mode"
    zIndex: 99990, // Layer 2 (Middle)
    pointerEvents: 'none' as const, // CRITICAL: Allows clicks to pass through logic
    transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
  };

  // 2. DESKTOP CARD (Floating)
  const desktopStyle = {
    position: 'absolute' as const,
    left: 0, top: 0, width: '320px', borderRadius: '16px',
    pointerEvents: 'auto' as const,
  };

  // 3. MOBILE CARD (Fixed at Bottom)
  const mobileStyle = {
    position: 'fixed' as const,
    left: '16px', 
    right: '16px', 
    bottom: '24px', 
    width: 'auto', 
    borderRadius: '20px',
    pointerEvents: 'auto' as const, // CRITICAL: Forces buttons to be clickable
    // Removed 'transform: none' to prevent Framer Motion conflict
  };

  return (
    <>
      <style>{`
        .btn { 
          cursor: pointer; border: none; padding: 12px 16px; border-radius: 10px; 
          font-weight: 600; font-size: 14px; transition: all 0.2s; 
          display: inline-flex; justify-content: center; align-items: center;
          /* Ensure buttons are clickable */
          pointer-events: auto;
          position: relative;
          z-index: 100000;
        }
        .btn-primary { background: #0f172a; color: white; }
        .btn-back { background: transparent; color: #64748b; }
        .btn-skip { background: transparent; color: #94a3b8; font-size: 13px; margin-right: auto; }
        
        .progress-track { width: 100%; height: 4px; background: #f1f5f9; border-radius: 2px; margin-bottom: 20px; overflow: hidden; }
        .progress-fill { height: 100%; background: #3b82f6; transition: width 0.4s ease; }

        h3 { margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #1e293b; }
        p { margin: 0 0 24px; color: #475569; line-height: 1.6; font-size: 15px; }

        @media (max-width: 480px) {
           .btn { padding: 12px 10px; font-size: 13px; }
        }
      `}</style>
      
      {/* LAYER 1: SPOTLIGHT OVERLAY (Mobile Only) */}
      {isMobile && (
        <div style={spotlightStyle}></div>
      )}

      {/* LAYER 2: WIDGET CARD (Controls) */}
      <AnimatePresence mode='wait'>
        <motion.div 
          id="tour-card"
          initial={ isMobile ? { y: 100, opacity: 0 } : { opacity: 0, scale: 0.95 } }
          animate={{ 
            opacity: 1, 
            scale: 1, 
            // Apply correct style object
            ...(isMobile ? mobileStyle : desktopStyle),
            // Handle Coordinates
            x: isMobile ? 0 : coords.x,
            y: isMobile ? 0 : coords.y,
          }}
          exit={ isMobile ? { y: 100, opacity: 0 } : { opacity: 0, scale: 0.95 } }
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          style={{ 
            background: 'white', 
            color: '#333', 
            padding: '24px',
            boxShadow: '0 20px 60px -12px rgba(0,0,0,0.3)',
            fontFamily: 'Inter, sans-serif', 
            zIndex: 99999, // TOP LAYER (Above Spotlight)
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