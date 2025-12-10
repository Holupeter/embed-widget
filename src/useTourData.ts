// src/useTourData.ts
import { useState } from 'react'; // Removed 'useEffect'
import { MOCK_TOUR } from './mockData';

// --- INSTRUCTIONS FOR TEAM ---
// 1. Install Convex: npm install convex
// 2. Import your API: import { api } from "../../convex/_generated/api";
// 3. Import useEffect above.
// 4. Uncomment the "Real Data" section below.
// -----------------------------

// import { useQuery } from "convex/react";
// import { api } from "../convex/_generated/api"; 

// We use '_tourId' with an underscore to stop TypeScript complaining it's unused.
// When you uncomment the real code, remove the underscore.
export function useTourData(_tourId: string) {
  
  // OPTION A: MOCK DATA (Current Mode)
  // We only grab 'data' because we aren't updating it in Mock mode.
  const [data] = useState(MOCK_TOUR);

  // OPTION B: REAL DATA SWITCH (Uncomment when Backend is ready)
  /*
  // Add 'setData' back to the line above: const [data, setData] = useState(MOCK_TOUR);
  
  const realTour = useQuery(api.widget.getTour, { tourId: _tourId });
  
  useEffect(() => {
    if (realTour) {
      setData(realTour);
    }
  }, [realTour]);
  */

  return data;
}