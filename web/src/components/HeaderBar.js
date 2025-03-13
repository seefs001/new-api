import { API, getLogo, getSystemName, showSuccess } from '../helpers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
// Import Lucide icons
import {
  HelpCircle,
  Home,
  Info,
  Key,
  Languages,
  Menu,
  Moon,
  Package,
  Sun,
  Tag,
  Terminal,
  User,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import { useSetTheme, useTheme } from '../context/Theme';

// Import shadcn components
import { Button } from './ui/button';
import { StatusContext } from '../context/Status/index.js';
import { StyleContext } from '../context/Style/index.js';
import { UserContext } from '../context/User';
import { cn } from '../lib/utils';
import fireworks from 'react-fireworks';
import { stringToColor } from '../helpers/render';
import { useTranslation } from 'react-i18next';

const HeaderBar = () => {
  const { t, i18n } = useTranslation();
  const [userState, userDispatch] = useContext(UserContext);
  const [styleState, styleDispatch] = useContext(StyleContext);
  const [statusState, statusDispatch] = useContext(StatusContext);
  const location = useLocation();
  let navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const systemName = getSystemName();
  const logo = getLogo();
  const currentDate = new Date();
  // enable fireworks on new year(1.1 and 2.9-2.24)
  const isNewYear = (currentDate.getMonth() === 0 && currentDate.getDate() === 1);

  // Check if self-use mode is enabled
  const isSelfUseMode = statusState?.status?.self_use_mode_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;

  let navItems = [
    {
      text: t('首页'),
      itemKey: 'home',
      href: '/',
      icon: Home,
    },
    {
      text: t('控制台'),
      itemKey: 'detail',
      href: '/',
      icon: Terminal,
    },
    {
      text: t('定价'),
      itemKey: 'pricing',
      href: '/pricing',
      icon: Tag,
    },
    // Only include the docs button if docsLink exists
    ...(docsLink ? [{
      text: t('文档'),
      itemKey: 'docs',
      isExternal: true,
      externalLink: docsLink,
      icon: HelpCircle,
    }] : []),
    {
      text: t('关于'),
      itemKey: 'about',
      href: '/about',
      icon: Info,
    },
  ];

  async function logout() {
    await API.get('/api/user/logout');
    showSuccess(t('注销成功!'));
    userDispatch({ type: 'logout' });
    localStorage.removeItem('user');
    navigate('/login');
  }

  const handleNewYearClick = () => {
    fireworks.init('root', {});
    fireworks.start();
    setTimeout(() => {
      fireworks.stop();
      setTimeout(() => {
        window.location.reload();
      }, 10000);
    }, 3000);
  };

  // Get theme state from context
  const theme = useTheme();
  const setTheme = useSetTheme();

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Use system preference as fallback
      setTheme('dark');
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    // Store theme preference in localStorage
    if (theme) {
      localStorage.setItem('theme', theme);
    }

    if (theme === 'dark') {
      document.body.setAttribute('theme-mode', 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.body.removeAttribute('theme-mode');
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    
    // Send current theme mode to child iframe
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage({ themeMode: theme }, '*');
      } catch (e) {
        console.error('Error posting theme to iframe:', e);
      }
    }

    if (isNewYear) {
      console.log('Happy New Year!');
    }
  }, [theme]);

  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLang(lng);
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage({ lang: lng }, '*');
        } catch (e) {
          console.error('Error posting language to iframe:', e);
        }
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleNavButtonClick = (itemKey) => {
    if (itemKey === 'home') {
      styleDispatch({ type: 'SET_INNER_PADDING', payload: false });
      styleDispatch({ type: 'SET_SIDER', payload: false });
    } else {
      styleDispatch({ type: 'SET_INNER_PADDING', payload: true });
      if (!styleState.isMobile) {
        styleDispatch({ type: 'SET_SIDER', payload: true });
      }
    }
  };

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    console.log('Theme toggled to:', newTheme);
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2" onClick={() => handleNavButtonClick('home')}>
            {styleState.isMobile ? (
              <div className="flex items-center relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    styleDispatch({ 
                      type: 'SET_SIDER', 
                      payload: !styleState.showSider 
                    });
                  }}
                  className="mr-2"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                {(isSelfUseMode || isDemoSiteMode) && (
                  <span className={cn(
                    "absolute -top-2 -right-3 text-xs px-1 py-0.5 rounded", 
                    isSelfUseMode ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" : 
                    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  )}>
                    {isSelfUseMode ? t('自用模式') : t('演示站点')}
                  </span>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border border-primary/50 relative overflow-hidden shadow-xs hover:shadow-sm transition-shadow duration-200">
                  {logo ? (
                    <img src={logo} alt="logo" className="h-6 w-auto" />
                  ) : (
                    <Package className="h-6 w-6 text-primary" />
                  )}
                  {(isSelfUseMode || isDemoSiteMode) && (
                    <span className={cn(
                      "absolute -top-2 -right-2 text-xs px-1 py-0.5 rounded whitespace-nowrap shadow-xs", 
                      isSelfUseMode ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" : 
                      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    )}>
                      {isSelfUseMode ? t('自用模式') : t('演示站点')}
                    </span>
                  )}
                </div>
                <span className="hidden font-bold text-primary text-xl sm:inline-block transition-colors">{systemName}</span>
              </>
            )}
          </Link>

          {/* Desktop nav */}
          {!styleState.isMobile && (
            <nav className="hidden md:flex gap-6">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                
                if (item.isExternal) {
                  return (
                    <a 
                      key={item.itemKey}
                      href={item.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.text}
                    </a>
                  );
                }
                
                return (
                  <Link
                    key={item.itemKey}
                    to={item.href}
                    onClick={() => handleNavButtonClick(item.itemKey)}
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.text}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Languages className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleLanguageChange('zh')} className={currentLang === 'zh' ? "bg-primary/10" : ""}>
                中文
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('en')} className={currentLang === 'en' ? "bg-primary/10" : ""}>
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* User menu */}
          {userState.token ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full text-white"
                    style={{ backgroundColor: stringToColor(userState.user?.username || 'User') }}
                  >
                    {userState.user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/personal')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('个人设置')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/token')}>
                  <Key className="mr-2 h-4 w-4" />
                  <span>{t('API令牌')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  {t('退出登录')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" onClick={() => navigate('/login')}>
              {t('登录')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
