// widget/src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// ➡️ ADDED: Imports for Convex
import { ConvexProvider, ConvexReactClient } from "convex/react"; 

const WIDGET_ID = 'walkmanjs-widget';

function mount() {
  if (document.getElementById(WIDGET_ID)) return;

  // 1. INTELLIGENT CONFIGURATION
  const currentScript = document.currentScript as HTMLScriptElement;
  const tourId = currentScript?.getAttribute('data-tour-id') || 'demo-tour';
    // ➡️ ADDED: Get API Key from the script tag
    const apiKey = currentScript?.getAttribute('data-api-key');

    // ➡️ ADDED: Initialize Convex Client
    const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
    
    // Safety check: Don't crash if the environment variable wasn't set on Netlify
    if (!convexUrl) {
        console.error("WalkmanJS Error: NEXT_PUBLIC_CONVEX_URL is not defined. Cannot fetch tour data.");
        return; 
    }
    const convex = new ConvexReactClient(convexUrl);


  const container = document.createElement('div');
  container.id = WIDGET_ID;
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: 'open' });
  const root = document.createElement('div');
  shadow.appendChild(root);

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
        {/* ➡️ WRAP THE APP WITH CONVEX PROVIDER */}
        <ConvexProvider client={convex}>
            {/* Pass the ID and API Key to the App */}
            <App 
                shadowRoot={shadow} 
                tourId={tourId} 
                apiKey={apiKey ?? undefined} // ⬅️ ADDED: Pass the API key, ensuring null is converted to undefined
            />
        </ConvexProvider>
    </React.StrictMode>
  );
}

if (document.readyState === 'complete') mount();
else window.addEventListener('load', mount);