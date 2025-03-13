import { API, getLogo, getSystemName, showError } from '../helpers/index.js';
import React, { useContext, useEffect } from 'react';

import App from '../App.js';
import FooterBar from './Footer.js';
import HeaderBar from './HeaderBar.js';
import SiderBar from './SiderBar.js';
import { StatusContext } from '../context/Status/index.js';
import { StyleContext } from '../context/Style/index.js';
import { ToastContainer } from 'react-toastify';
import { UserContext } from '../context/User/index.js';
import { cn } from '../lib/utils';
import { setStatusData } from '../helpers/data.js';
import { useTranslation } from 'react-i18next';

const PageLayout = () => {
  const [userState, userDispatch] = useContext(UserContext);
  const [statusState, statusDispatch] = useContext(StatusContext);
  const [styleState, styleDispatch] = useContext(StyleContext);
  const { i18n } = useTranslation();

  const loadUser = () => {
    let user = localStorage.getItem('user');
    if (user) {
      let data = JSON.parse(user);
      userDispatch({ type: 'login', payload: data });
    }
  };

  const loadStatus = async () => {
    try {
      const res = await API.get('/api/status');
      const { success, data } = res.data;
      if (success) {
        statusDispatch({ type: 'set', payload: data });
        setStatusData(data);
      } else {
        showError('Unable to connect to server');
      }
    } catch (error) {
      showError('Failed to load status');
    }
  };

  useEffect(() => {
    loadUser();
    loadStatus().catch(console.error);
    let systemName = getSystemName();
    if (systemName) {
      document.title = systemName;
    }
    let logo = getLogo();
    if (logo) {
      let linkElement = document.querySelector("link[rel~='icon']");
      if (linkElement) {
        linkElement.href = logo;
      }
    }
    // 从localStorage获取上次使用的语言
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang) {
      i18n.changeLanguage(savedLang);
    }
    
    // 默认显示侧边栏
    styleDispatch({ type: 'SET_SIDER', payload: true });
  }, [i18n]);

  // 获取侧边栏折叠状态
  const isSidebarCollapsed = localStorage.getItem('default_collapse_sidebar') === 'true';

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className={cn(
        "p-0 z-50 w-full bg-background border-b",
        styleState.isMobile ? "sticky top-0" : "fixed top-0 w-full shadow-xs"
      )}>
        <HeaderBar />
      </header>

      {/* Main Content Area */}
      <div className={cn(
        "flex grow overflow-hidden",
        styleState.isMobile ? "" : "mt-14" // 56px header height
      )}>
        {/* Sidebar */}
        {styleState.showSider && (
          <div className={cn(
            styleState.isMobile ? "relative" : "fixed left-0 top-14 h-[calc(100vh-56px)] z-40"
          )}>
            <SiderBar />
          </div>
        )}

        {/* Content */}
        <div className={cn(
          "flex flex-col grow transition-all duration-300",
          styleState.isMobile ? "" : styleState.showSider ? 
          (styleState.siderCollapsed ? "ml-16" : "ml-64") : "ml-0"
        )}>
          <main className={cn(
            "grow",
            styleState.isMobile ? "overflow-visible" : "overflow-auto",
            styleState.shouldInnerPadding ? "p-6" : "p-0",
            "relative"
          )}>
            <App />
          </main>

          {/* Footer */}
          <footer className="shrink-0 w-full">
            <FooterBar />
          </footer>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default PageLayout;