import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const WIDGET_ID = 'onboardjs-widget';

function mount() {
  if (document.getElementById(WIDGET_ID)) return;

  // 1. INTELLIGENT CONFIGURATION
  // We look for the script tag that loaded this file
  const currentScript = document.currentScript as HTMLScriptElement;
  // If the user wrote <script src="..." data-tour-id="123">, we grab "123"
  const tourId = currentScript?.getAttribute('data-tour-id') || 'demo-tour';

  const container = document.createElement('div');
  container.id = WIDGET_ID;
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: 'open' });
  const root = document.createElement('div');
  shadow.appendChild(root);

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      {/* Pass the ID to the App */}
      <App shadowRoot={shadow} tourId={tourId} />
    </React.StrictMode>
  );
}

if (document.readyState === 'complete') mount();
else window.addEventListener('load', mount);