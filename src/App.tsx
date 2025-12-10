import { useEffect, useState } from 'react';
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTourData } from './useTourData';

interface AppProps {
  shadowRoot: ShadowRoot;
  tourId: string;
  apiKey?: string;
}

export default function App({ shadowRoot, tourId, apiKey }: AppProps) {
  const { tourData, isValidApiKey } = useTourData(tourId, apiKey);

  // --- STATE ---
  const [index, setIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('tour_progress');
      return saved ? parseInt(saved, 10) : 0;
    } catch { return 0; }
  });

  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [targetRect, setTargetRect] = useState({ top: 0, left: 0, width: 0, height: 0 });

  if (isValidApiKey === false) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontFamily: 'sans-serif' }}>
        <strong>Error:</strong> Invalid API Key. Please check your configuration.
      </div>
    );
  }

  // Guard Clause for loading state or no tour data
  if (!tourData || !tourData.steps) return null;

  const step = tourData.steps[index];
  const isLast = index === tourData.steps.length - 1;
  const progress = ((index + 1) / tourData.steps.length) * 100;

  // --- ANALYTICS HANDLER ---
  const trackEvent = (event: string, meta = {}) => {
    console.log(`[WalkmanJS Analytics] ${event}`, meta);
    // TEAM TODO: Uncomment to send to Convex
    // convex.mutation(api.analytics.track, { tourId, event, ...meta });
  };

  useEffect(() => {
    // Track Tour Started on load if index is 0
    if (index === 0) trackEvent("tour_started");
    localStorage.setItem('tour_progress', index.toString());
  }, [index]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- POSITIONING ENGINE ---
  useEffect(() => {
    if (!step) return;

    // NOTE: Updated to use 'targetSelector' instead of 'targetId'
    const target = document.querySelector(step.targetSelector);
    
    // Track Step View
    trackEvent("step_viewed", { stepId: step.stepId });

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const updateCalculations = () => {
      if (!target) return;
      const rect = target.getBoundingClientRect();
      setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });

      if (!isMobile) {
        const tooltip = shadowRoot.getElementById('tour-card');
        if (tooltip) {
          computePosition(target, tooltip, {
            placement: 'bottom',
            middleware: [offset(20), flip({ fallbackPlacements: ['top', 'right', 'left'] }), shift({ padding: 20 })],
          }).then(({ x, y }) => {
            setCoords({ x, y });
          });
        }
      }
    };

    let cleanup: () => void;
    if (target) cleanup = autoUpdate(target, document.body, updateCalculations);
    return () => { if (cleanup) cleanup(); };
  }, [shadowRoot, index, step, isMobile]);

  const finishTour = () => {
    trackEvent("tour_completed");
    setIsVisible(false);
    localStorage.removeItem('tour_progress');
  };

  const next = () => {
    trackEvent("step_completed", { stepId: step.stepId });
    if (isLast) finishTour();
    else setIndex(prev => prev + 1);
  };

  const skip = () => {
    trackEvent("step_skipped", { stepId: step.stepId });
    finishTour();
  }

  if (!isVisible) return null;

  // --- STYLES & THEME ---
  // Using theme values from the Tour Object
  const theme = tourData.theme;

  const spotlightStyle = {
    position: 'fixed' as const,
    top: targetRect.top, left: targetRect.left, width: targetRect.width, height: targetRect.height,
    borderRadius: '8px',
    boxShadow: `0 0 0 9999px rgba(0, 0, 0, ${theme.overlayEnabled ? theme.overlayOpacity : 0})`, // Dynamic Opacity
    zIndex: 99990, pointerEvents: 'none' as const,
    transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
  };

  const desktopStyle = {
    position: 'absolute' as const, left: 0, top: 0, width: '320px', 
    borderRadius: `${theme.borderRadius}px`,
    pointerEvents: 'auto' as const,
  };

  const mobileStyle = {
    position: 'fixed' as const, left: '16px', right: '16px', bottom: '24px', width: 'auto', 
    borderRadius: `${theme.borderRadius}px`,
    pointerEvents: 'auto' as const,
  };

  return (
    <>
      <style>{`
        .btn { 
          cursor: pointer; border: none; padding: 12px 16px; 
          border-radius: ${theme.borderRadius - 4}px; 
          font-weight: 600; font-size: 14px; transition: all 0.2s; 
          display: inline-flex; justify-content: center; align-items: center;
          pointer-events: auto; position: relative; z-index: 100000;
        }
        /* Dynamic Primary Color */
        .btn-primary { background: ${theme.primaryColor}; color: white; }
        .btn-back { background: transparent; color: #64748b; }
        .btn-skip { background: transparent; color: #94a3b8; font-size: 13px; margin-right: auto; }
        
        .progress-track { width: 100%; height: 4px; background: #f1f5f9; border-radius: 2px; margin-bottom: 20px; overflow: hidden; }
        /* Dynamic Progress Color */
        .progress-fill { height: 100%; background: ${theme.primaryColor}; transition: width 0.4s ease; }

        h3 { margin: 0 0 8px; font-size: 18px; font-weight: 700; color: ${theme.textColor}; }
        p { margin: 0 0 24px; color: ${theme.textColor}; opacity: 0.8; line-height: 1.6; font-size: 15px; }

        @media (max-width: 480px) { .btn { padding: 12px 10px; font-size: 13px; } }
      `}</style>
      
      {isMobile && theme.overlayEnabled && ( <div style={spotlightStyle}></div> )}

      <AnimatePresence mode='wait'>
        <motion.div 
          id="tour-card"
          initial={ isMobile ? { y: 100, opacity: 0 } : { opacity: 0, scale: 0.95 } }
          animate={{ 
            opacity: 1, scale: 1, 
            ...(isMobile ? mobileStyle : desktopStyle),
            x: isMobile ? 0 : coords.x,
            y: isMobile ? 0 : coords.y,
          }}
          exit={ isMobile ? { y: 100, opacity: 0 } : { opacity: 0, scale: 0.95 } }
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          style={{ 
            background: theme.backgroundColor, // Dynamic BG
            color: theme.textColor, // Dynamic Text
            padding: '24px',
            boxShadow: '0 20px 60px -12px rgba(0,0,0,0.3)',
            fontFamily: 'Inter, sans-serif', 
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
            {/* NOTE: Updated field name 'content' */}
            <p>{step.content}</p>
          </motion.div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="btn btn-skip" onClick={skip}>Skip</button>
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