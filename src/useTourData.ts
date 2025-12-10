import { useState } from 'react'; // FIXED: Removed 'useEffect'

// --- DATA STRUCTURES (MATCHING THE DOCS) ---

export interface Step {
  _id: string;
  tourId: string;
  stepId: string;
  title: string;
  content: string;
  targetSelector: string;
  position: "top" | "bottom" | "left" | "right";
  order: number;
}

export interface TourConfig {
  _id: string;
  name: string;
  status: "draft" | "active" | "paused";
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
    overlayEnabled: boolean;
    overlayOpacity: number;
  };
  targeting: {
    urlMatchType: "exact" | "contains" | "regex";
    urlPattern: string;
    frequency: "once" | "session" | "always";
  };
  steps: Step[];
}

// --- MOCK DATA ---
const MOCK_DATA: TourConfig = {
  _id: "demo-tour-123",
  name: "Onboarding Demo",
  status: "active",
  theme: {
    primaryColor: "#2563eb",
    backgroundColor: "#ffffff",
    textColor: "#1e293b",
    borderRadius: 16,
    overlayEnabled: true,
    overlayOpacity: 0.5
  },
  targeting: {
    urlMatchType: "contains",
    urlPattern: "/",
    frequency: "always"
  },
  steps: [
    { _id: "s1", tourId: "t1", stepId: "step_1", order: 0, title: "👋 Welcome", content: "Start your journey here.", targetSelector: "#signup-btn", position: "bottom" },
    { _id: "s2", tourId: "t1", stepId: "step_2", order: 1, title: "📊 Analytics", content: "Track your growth.", targetSelector: "#feature-section", position: "right" },
    { _id: "s3", tourId: "t1", stepId: "step_3", order: 2, title: "💎 Pricing", content: "Choose a plan.", targetSelector: "#pricing-plan", position: "left" },
    { _id: "s4", tourId: "t1", stepId: "step_4", order: 3, title: "⚙️ Settings", content: "Configure your profile.", targetSelector: "#settings-icon", position: "bottom" },
    { _id: "s5", tourId: "t1", stepId: "step_5", order: 4, title: "❓ Support", content: "We are here to help.", targetSelector: "#help-btn", position: "top" }
  ]
};

// --- TEAM INSTRUCTIONS ---
// 1. Uncomment Convex imports
// 2. Uncomment 'useQuery', 'useEffect', and 'shouldShowTour' logic below
// -------------------------

// import { useQuery } from "convex/react";
// import { api } from "../convex/_generated/api";

// FIXED: Added underscores to arguments so TS doesn't complain they are unused
export function useTourData(_tourId: string, _apiKey?: string) {
  
  // FIXED: Removed 'setData' since we aren't using it in Mock Mode
  const [data] = useState<TourConfig | null>(MOCK_DATA);

  // --- LOGIC: HELPER FUNCTIONS (Uncomment when switching to Real Data) ---
  /*
  const shouldShowTour = (targeting: any, currentUrl: string) => {
    if (!targeting?.urlPattern) return true;
    if (targeting.urlMatchType === "contains") return currentUrl.includes(targeting.urlPattern);
    return true;
  };
  */

  // --- LOGIC: REAL DATA FETCHING (Uncomment when Backend is ready) ---
  /*
  const realTour = useQuery(api.tours.get, { tourId: _tourId });
  const realSteps = useQuery(api.steps.list, { tourId: _tourId });

  // Note: Add 'useEffect' back to imports above
  // Note: Add 'setData' back to useState above
  
  useEffect(() => {
    if (realTour && realSteps) {
       const fullConfig = { ...realTour, steps: realSteps };
       
       if (shouldShowTour(fullConfig.targeting, window.location.href)) {
         setData(fullConfig);
       }
    }
  }, [realTour, realSteps]);
  */

  return data;
}