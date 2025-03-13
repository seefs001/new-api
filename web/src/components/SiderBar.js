import '../index.css';

import {
  API,
  getLogo,
  getSystemName,
  isAdmin,
  isMobile,
  showError,
} from '../helpers';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  BarChartIcon,
  CalendarClockIcon,
  CheckSquareIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  GiftIcon,
  HelpCircleIcon,
  HomeIcon,
  ImageIcon,
  KeyIcon,
  LayersIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  SettingsIcon,
  TagIcon,
  UserIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useSetTheme, useTheme } from '../context/Theme/index.js';

import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { StatusContext } from '../context/Status';
import { StyleContext } from '../context/Style/index.js';
import { Switch } from './ui/switch';
import { UserContext } from '../context/User';
import { cn } from '../lib/utils';
import { setStatusData } from '../helpers/data.js';
import { stringToColor } from '../helpers/render.js';
import { useTranslation } from 'react-i18next';

// Define routerMap as a constant outside the component
const routerMap = {
  home: '/',
  channel: '/channel',
  token: '/token',
  redemption: '/redemption',
  topup: '/topup',
  user: '/user',
  log: '/log',
  midjourney: '/midjourney',
  setting: '/setting',
  about: '/about',
  detail: '/detail',
  pricing: '/pricing',
  task: '/task',
  playground: '/playground',
  personal: '/personal',
};

const SiderBar = () => {
  const { t } = useTranslation();
  const [styleState, styleDispatch] = useContext(StyleContext);
  const [statusState, statusDispatch] = useContext(StatusContext);
  const defaultIsCollapsed =
    localStorage.getItem('default_collapse_sidebar') === 'true';

  const [selectedKeys, setSelectedKeys] = useState(['home']);
  const [isCollapsed, setIsCollapsed] = useState(defaultIsCollapsed);
  const [chatItems, setChatItems] = useState([]);
  const [openedKeys, setOpenedKeys] = useState([]);
  const theme = useTheme();
  const setTheme = useSetTheme();
  const location = useLocation();
  const [routerMapState, setRouterMapState] = useState(routerMap);
  const navigate = useNavigate();

  // 使用useEffect监听location变化，设置正确的选中项
  useEffect(() => {
    let pathname = location.pathname;
    if (pathname.startsWith('/chat/')) {
      const chatId = pathname.replace('/chat/', '');
      setSelectedKeys(['chat' + chatId]);
    } else {
      for (const [key, value] of Object.entries(routerMapState)) {
        if (pathname === value) {
          setSelectedKeys([key]);
          break;
        }
      }
    }
  }, [location, routerMapState]);

  useEffect(() => {
    localStorage.setItem('default_collapse_sidebar', isCollapsed.toString());
  }, [isCollapsed]);

  // Add effect for loading chat items
  useEffect(() => {
    let chats = localStorage.getItem('chats');
    if (chats) {
      try {
        chats = JSON.parse(chats);
        if (Array.isArray(chats)) {
          let chatLabels = [];
          for (let i = 0; i < chats.length; i++) {
            // Extract the chat name (first key value in each chat object)
            const chatName = Object.keys(chats[i])[0] || `Chat ${i+1}`;
            chatLabels.push(chatName);
          }
          setChatItems(chatLabels);
          
          // Update router map with chat routes
          updateRouterMapWithChats(chats);
        }
      } catch (e) {
        console.error(e);
        showError('聊天数据解析失败');
      }
    }
  }, []);

  const workspaceItems = useMemo(
    () => [
      {
        text: t('数据看板'),
        itemKey: 'detail',
        to: '/detail',
        icon: <CalendarClockIcon className="h-5 w-5" />,
        isHidden: localStorage.getItem('enable_data_export') !== 'true',
      },
      {
        text: t('API令牌'),
        itemKey: 'token',
        to: '/token',
        icon: <KeyIcon className="h-5 w-5" />,
      },
      {
        text: t('使用日志'),
        itemKey: 'log',
        to: '/log',
        icon: <BarChartIcon className="h-5 w-5" />,
      },
      {
        text: t('绘图日志'),
        itemKey: 'midjourney',
        to: '/midjourney',
        icon: <ImageIcon className="h-5 w-5" />,
        isHidden: localStorage.getItem('enable_drawing') !== 'true',
      },
      {
        text: t('任务日志'),
        itemKey: 'task',
        to: '/task',
        icon: <CheckSquareIcon className="h-5 w-5" />,
        isHidden: localStorage.getItem('enable_task') !== 'true',
      }
    ],
    [
      localStorage.getItem('enable_data_export'),
      localStorage.getItem('enable_drawing'),
      localStorage.getItem('enable_task'),
      t,
    ],
  );

  const financeItems = useMemo(
    () => [
      {
        text: t('钱包'),
        itemKey: 'topup',
        to: '/topup',
        icon: <CreditCardIcon className="h-5 w-5" />,
      },
      {
        text: t('个人设置'),
        itemKey: 'personal',
        to: '/personal',
        icon: <UserIcon className="h-5 w-5" />,
      },
    ],
    [t],
  );

  const adminItems = useMemo(
    () => [
      {
        text: t('渠道'),
        itemKey: 'channel',
        to: '/channel',
        icon: <LayersIcon className="h-5 w-5" />,
        isHidden: !isAdmin(),
      },
      {
        text: t('兑换码'),
        itemKey: 'redemption',
        to: '/redemption',
        icon: <GiftIcon className="h-5 w-5" />,
        isHidden: !isAdmin(),
      },
      {
        text: t('用户管理'),
        itemKey: 'user',
        to: '/user',
        icon: <UserIcon className="h-5 w-5" />,
      },
      {
        text: t('系统设置'),
        itemKey: 'setting',
        to: '/setting',
        icon: <SettingsIcon className="h-5 w-5" />,
      },
    ],
    [isAdmin(), t],
  );

  const chatMenuItems = useMemo(
    () => [
      {
        text: 'Playground',
        itemKey: 'playground',
        to: '/playground',
        icon: <MessageCircleIcon className="h-5 w-5" />,
      },
      {
        text: t('聊天'),
        itemKey: 'chat',
        items: chatItems,
        icon: <MessageSquareIcon className="h-5 w-5" />,
      },
    ],
    [chatItems, t],
  );

  // Function to update router map with chat routes
  const updateRouterMapWithChats = (chats) => {
    const newRouterMap = { ...routerMap };
    
    if (Array.isArray(chats) && chats.length > 0) {
      for (let i = 0; i < chats.length; i++) {
        newRouterMap['chat' + i] = '/chat/' + i;
      }
    }
    
    setRouterMapState(newRouterMap);
  };

  // 获取用户信息
  const getUserInfo = () => {
    const userInfo = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user'))
      : {
          username: 'Error',
          role: '',
        };
    return userInfo;
  };

  // 渲染顶部用户信息卡片
  const renderUserBlock = () => {
    let userInfo = getUserInfo();
    
    return (
      <div className={cn(
        "p-4",
        isCollapsed ? "items-center" : ""
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2 cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userInfo.avatar || ""} alt={userInfo.username} />
                <AvatarFallback style={{ backgroundColor: stringToColor(userInfo.username) }}>
                  {userInfo.username.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{userInfo.username}</span>
                  <span className="text-xs text-muted-foreground">{userInfo.role || t('用户')}</span>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => navigate('/personal')}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>{t('个人设置')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => switchTheme()}>
              <div className="flex items-center w-full justify-between">
                <span>{t('深色模式')}</span>
                <Switch checked={theme === 'dark'} />
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              {t('退出登录')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  // 处理退出登录
  const logout = async () => {
    const res = await API.get('/api/user/logout');
    const { success, message } = res.data;
    if (success) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    } else {
      showError(message);
    }
  };

  const renderNavItem = (item) => {
    if (item.isHidden) return null;
    
    const isActive = selectedKeys.includes(item.itemKey);
    
    return (
      <Link
        key={item.itemKey}
        to={item.to}
        className={cn(
          "flex items-center py-2 px-3 my-1 mx-2 rounded-md transition-colors",
          isActive 
            ? "bg-primary/10 text-primary font-medium" 
            : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
          isCollapsed ? "justify-center" : ""
        )}
      >
        {item.icon}
        {!isCollapsed && <span className="ml-2">{item.text}</span>}
      </Link>
    );
  };

  const renderNavItemWithDropdown = (item) => {
    if (!item.items || item.items.length === 0) return null;
    
    const isOpen = openedKeys.includes(item.itemKey);
    
    const toggleSubmenu = (e) => {
      e.preventDefault();
      setOpenedKeys(prev => 
        prev.includes(item.itemKey) 
          ? prev.filter(key => key !== item.itemKey) 
          : [...prev, item.itemKey]
      );
    };
    
    return (
      <div key={item.itemKey} className="my-1">
        <button
          onClick={toggleSubmenu}
          className={cn(
            "flex items-center py-2 px-3 mx-2 rounded-md w-full text-left transition-colors",
            isOpen 
              ? "bg-primary/10 text-primary font-medium" 
              : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
            isCollapsed ? "justify-center" : ""
          )}
        >
          {item.icon}
          {!isCollapsed && (
            <>
              <span className="ml-2 grow">{item.text}</span>
              <ChevronDownIcon className={cn(
                "h-4 w-4 transition-transform",
                isOpen ? "transform rotate-180" : ""
              )} />
            </>
          )}
        </button>
        
        {isOpen && !isCollapsed && (
          <div className="ml-4 pl-2 border-l border-border">
            {item.items.map((subItem, index) => (
              <Link
                key={`${item.itemKey}${index}`}
                to={`/chat/${index}`}
                className={cn(
                  "flex items-center py-2 px-3 my-1 mx-2 rounded-md transition-colors",
                  selectedKeys.includes(`chat${index}`) 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                )}
              >
                <span className="truncate">{subItem}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 切换侧边栏折叠状态
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // 切换主题
  const switchTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    styleDispatch({ type: 'update', darkMode: newTheme === 'dark' });
  };

  return (
    <div className={cn(
      "border-r border-border h-screen flex flex-col bg-background transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <Link to="/" className="flex items-center">
            <img src={getLogo()} alt="Logo" className="h-8 w-8" />
            <span className="ml-2 font-bold text-xl">{getSystemName()}</span>
          </Link>
        )}
        {isCollapsed && (
          <Link to="/" className="mx-auto">
            <img src={getLogo()} alt="Logo" className="h-8 w-8" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className={cn(isCollapsed ? "mx-auto" : "")}
        >
          {isCollapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* User Info */}
      {renderUserBlock()}
      
      {/* Navigation */}
      <ScrollArea className="grow">
        <div className="py-2">
          {/* Home Link */}
          <Link
            to="/"
            className={cn(
              "flex items-center py-2 px-3 my-1 mx-2 rounded-md transition-colors",
              selectedKeys.includes('home') 
                ? "bg-primary/10 text-primary font-medium" 
                : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <HomeIcon className="h-5 w-5" />
            {!isCollapsed && <span className="ml-2">{t('首页')}</span>}
          </Link>
          
          {/* Chatbot Section */}
          <div className="mt-4">
            {!isCollapsed && <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground">{t('AI助手')}</div>}
            {chatMenuItems.map(item => 
              item.items ? renderNavItemWithDropdown(item) : renderNavItem(item)
            )}
          </div>
          
          {/* Workspace Section */}
          <div className="mt-4">
            {!isCollapsed && <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground">{t('工作台')}</div>}
            {workspaceItems.map(renderNavItem)}
          </div>
          
          {/* Finance Section */}
          <div className="mt-4">
            {!isCollapsed && <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground">{t('财务')}</div>}
            {financeItems.map(renderNavItem)}
          </div>
          
          {/* Admin Section */}
          <div className="mt-4">
            {!isCollapsed && <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground">{t('管理')}</div>}
            {adminItems.map(renderNavItem)}
          </div>
          
          {/* About Section */}
          <div className="mt-4">
            <Link
              to="/about"
              className={cn(
                "flex items-center py-2 px-3 my-1 mx-2 rounded-md transition-colors",
                selectedKeys.includes('about') 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <HelpCircleIcon className="h-5 w-5" />
              {!isCollapsed && <span className="ml-2">{t('关于')}</span>}
            </Link>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SiderBar;
