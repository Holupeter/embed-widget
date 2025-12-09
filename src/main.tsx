import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const WIDGET_ID = 'onboardjs-tour-widget';

function mountWidget() {
  // Prevent duplicate injections
  if (document.getElementById(WIDGET_ID)) return;

  // 1. Create the container
  const widgetHost = document.createElement('div');
  widgetHost.id = WIDGET_ID;
  document.body.appendChild(widgetHost);

  // 2. Create the Shadow DOM (The Firewall)
  const shadowRoot = widgetHost.attachShadow({ mode: 'open' });

  // 3. Create the React Root inside Shadow DOM
  const appRoot = document.createElement('div');
  appRoot.id = 'root';
  shadowRoot.appendChild(appRoot);

  // 4. Render React
  ReactDOM.createRoot(appRoot).render(
    <React.StrictMode>
      <App shadowRoot={shadowRoot} />
    </React.StrictMode>
  );
}

// Auto-start
if (document.readyState === 'complete') {
  mountWidget();
} else {
  window.addEventListener('load', mountWidget);
}

// Typing for TypeScript
declare global {
  interface Window {
    initTourWidget: () => void;
  }
}
window.initTourWidget = mountWidget;