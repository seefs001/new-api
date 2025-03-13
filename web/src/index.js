import 'semantic-ui-offline/semantic.min.css';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import './i18n/i18n.js';

import App from './App';
import { BrowserRouter } from 'react-router-dom';
import FooterBar from './components/Footer';
import HeaderBar from './components/HeaderBar';
import PageLayout from './components/PageLayout.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import SiderBar from './components/SiderBar';
import { StatusProvider } from './context/Status';
import { StyleProvider } from './context/Style/index.js';
import { ThemeProvider } from './context/Theme';
import { ToastContainer } from 'react-toastify';
import { UserProvider } from './context/User';

// initialization

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StatusProvider>
      <UserProvider>
        <BrowserRouter>
          <ThemeProvider>
            <StyleProvider>
              <PageLayout/>
            </StyleProvider>
          </ThemeProvider>
        </BrowserRouter>
      </UserProvider>
    </StatusProvider>
  </React.StrictMode>,
);
