import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Smoke test: renders the same provider tree as src/index.tsx and confirms
// the unauthenticated app lands on the login screen without crashing.
test('renders the login screen when not authenticated', () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );

  expect(screen.getByText(/username/i)).toBeInTheDocument();
});
