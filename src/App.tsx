import { useEffect, useState } from 'react';
import { computePosition, flip, shift, offset } from '@floating-ui/dom';
import { motion, AnimatePresence } from 'framer-motion'; // IMPORT ANIMATION
import { MOCK_TOUR } from './mockData';

interface AppProps {
  shadowRoot: ShadowRoot;
}

export default function App({ shadowRoot }: AppProps) {
  // 1. Initialize state from LocalStorage (if it exists)
const [index, setIndex] = useState(() => {
  try {
    const saved = localStorage.getItem('onboard_tour_step');
    console.log("Reading from memory:", saved); // Check Console!
    return saved ? parseInt(saved, 10) : 0;
  } catch (e) {
    console.warn("Storage access failed:", e);
    return 0;
  }
});


  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);

  const step = MOCK_TOUR.steps[index];
  const isLast = index === MOCK_TOUR.steps.length - 1;

  useEffect(() => {
  console.log("Saving step:", index); // Check Console!
  localStorage.setItem('onboard_tour_step', index.toString());
}, [index]);

  useEffect(() => {
    if (!step) return;

    const updatePosition = () => {
      const target = document.querySelector(step.targetId);
      // We look for the container div
      // Note: We don't need to find 'tour-card' by ID for positioning logic 
      // if we trust the coords update, but Floating UI needs the reference.
      // Since Framer Motion handles the render, we can just use a hidden ref or logic.
      // BUT for simplicity, let's keep using the coords state.
      
      // Trick: We need to wait for the element to exist in the DOM for Floating UI
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
    
    // Quick interval to catch layout shifts
    const interval = setInterval(updatePosition, 100);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      clearInterval(interval);
    };
  }, [shadowRoot, index]);

  const next = () => {
  if (isLast) {
    setIsVisible(false);
    localStorage.removeItem('onboard_tour_step');
    alert("Tour Finished!"); 
  } else {
    setIndex(prev => prev + 1);
  }
};

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        /* We remove the transition property here because Framer handles it */
        .btn { cursor: pointer; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; }
        .btn-primary { background: #111; color: white; }
        .btn-back { background: transparent; color: #666; }
        .btn-back:hover { background: #f0f0f0; }
      `}</style>
      
      <AnimatePresence mode='wait'>
        <motion.div 
          id="tour-card"
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            x: coords.x, // Framer Motion handles the movement to new X
            top: coords.y, // We animate 'top' instead of using transform directly to mix with x
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 80,  // Much softer pull
            damping: 20,    // Smooth braking
            mass: 1         // Heavier feel
          }}
          style={{ 
            position: 'absolute', 
            left: 0, // We keep left 0 and animate x
            width: '300px',
            background: '#fff', 
            color: '#333', 
            padding: '24px',
            borderRadius: '16px', 
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.2)',
            fontFamily: 'system-ui, sans-serif', 
            zIndex: 99999,
          }}
        >
          {/* We animate the text change too! */}
          <motion.div
            key={index} // This forces a re-render animation when index changes
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>
                {step.title}
            </h3>
            <p style={{ margin: '0 0 20px', color: '#666', lineHeight: 1.5 }}>
                {step.description}
            </p>
          </motion.div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: 12, color: '#aaa', fontWeight: 600 }}>
                  STEP {index + 1} OF {MOCK_TOUR.steps.length}
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                    className="btn btn-back" 
                    onClick={() => setIndex(prev => prev - 1)}
                    disabled={index === 0}
                    style={{ opacity: index === 0 ? 0 : 1 }}
                >
                    Back
                </button>
                <button className="btn btn-primary" onClick={next}>
                    {isLast ? 'Finish' : 'Next'}
                </button>
              </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}