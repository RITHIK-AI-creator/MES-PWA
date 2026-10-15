import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { AppProvider } from './context/AppContext';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
 <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Registers the service worker (production builds only) so the app is
// installable and the shell loads offline. onUpdate fires once a new
// build has finished downloading in the background, behind the one
// currently controlling open tabs.
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    if (window.confirm('A new version of this app is available. Reload now?')) {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  },
});
