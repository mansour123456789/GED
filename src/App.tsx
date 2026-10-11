import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { SessionProvider } from './store/sessionStore';
import { ThemeProvider } from './store/themeContext';
import { LangProvider } from './store/langContext';
import { NotificationsProvider } from './store/notificationsStore';
import { GuideProvider } from './store/guideStore';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LangProvider>
        <SessionProvider>
          <NotificationsProvider>
            <GuideProvider>
              <RouterProvider router={router} />
            </GuideProvider>
          </NotificationsProvider>
        </SessionProvider>
      </LangProvider>
    </ThemeProvider>
  );
};

export default App;
