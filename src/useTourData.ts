// src/useTourData.ts
import { useState, useEffect } from 'react';
import { MOCK_TOUR } from './mockData';

// --- INSTRUCTIONS FOR TEAM ---
// 1. Ensure 'tours' and 'steps' tables exist in Convex.
// 2. Uncomment the Convex import and the logic below.
// -----------------------------

// import { useQuery } from "convex/react";
// import { api } from "../convex/_generated/api"; 

export function useTourData(tourId: string) {
  // DEFAULT: Start with Mock Data so the UI never breaks
  const [data, setData] = useState(MOCK_TOUR);

  // --- REAL DATA SWITCH (Uncomment when Backend is ready) ---
  /*
  const realTour = useQuery(api.widget.getTour, { tourId });
  
  useEffect(() => {
    if (realTour) {
      setData(realTour);
    }
  }, [realTour]);
  */

  return data;
}