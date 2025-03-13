import { API, getLogo, showError, showInfo, showSuccess, updateAPI } from '../helpers';
import { Link, useNavigate } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import {onGitHubOAuthClicked, onLinuxDOOAuthClicked, onOIDCClicked} from './utils.js';

import LinuxDoIcon from './LinuxDoIcon.js';
import OIDCIcon from "./OIDCIcon.js";
import TelegramLoginButton from 'react-telegram-login/src';
import Turnstile from 'react-turnstile';
import { UserContext } from '../context/User/index.js';
import WeChatIcon from './WeChatIcon.js';
import { setUserData } from '../helpers/data.js';
import { useTranslation } from 'react-i18next';

const RegisterForm = () => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
    password2: '',
    email: '',
    verification_code: ''
  });
  const { username, password, password2 } = inputs;
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [userState, userDispatch] = useContext(UserContext);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWeChatLoginModal, setShowWeChatLoginModal] = useState(false);
  const [status, setStatus] = useState({});
  let navigate = useNavigate();
  const logo = getLogo();

  let affCode = new URLSearchParams(window.location.search).get('aff');
  if (affCode) {
    localStorage.setItem('aff', affCode);
  }

  useEffect(() => {
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      setStatus(status);
      setShowEmailVerification(status.email_verification);
      if (status.turnstile_check) {
        setTurnstileEnabled(true);
        setTurnstileSiteKey(status.turnstile_site_key);
      }
    }
  });

  const onWeChatLoginClicked = () => {
    setShowWeChatLoginModal(true);
  };

  const onSubmitWeChatVerificationCode = async () => {
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    const res = await API.get(
      `/api/oauth/wechat?code=${inputs.wechat_verification_code}`,
    );
    const { success, message, data } = res.data;
    if (success) {
      userDispatch({ type: 'login', payload: data });
      localStorage.setItem('user', JSON.stringify(data));
      setUserData(data);
      updateAPI();
      navigate('/');
      showSuccess('登录成功！');
      setShowWeChatLoginModal(false);
    } else {
      showError(message);
    }
  };

  function handleChange(name, value) {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  }

  async function handleSubmit(e) {
    if (password.length < 8) {
      showInfo('密码长度不得小于 8 位！');
      return;
    }
    if (password !== password2) {
      showInfo('两次输入的密码不一致');
      return;
    }
    if (username && password) {
      if (turnstileEnabled && turnstileToken === '') {
        showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
        return;
      }
      setLoading(true);
      if (!affCode) {
        affCode = localStorage.getItem('aff');
      }
      inputs.aff_code = affCode;
      const res = await API.post(
        `/api/user/register?turnstile=${turnstileToken}`,
        inputs
      );
      const { success, message } = res.data;
      if (success) {
        navigate('/login');
        showSuccess('注册成功！');
      } else {
        showError(message);
      }
      setLoading(false);
    }
  }

  const sendVerificationCode = async () => {
    if (inputs.email === '') return;
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    setLoading(true);
    const res = await API.get(
      `/api/verification?email=${inputs.email}&turnstile=${turnstileToken}`
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess('验证码发送成功，请检查你的邮箱！');
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const onTelegramLoginClicked = async (response) => {
    const fields = [
      'id',
      'first_name',
      'last_name',
      'username',
      'photo_url',
      'auth_date',
      'hash',
      'lang',
    ];
    const params = {};
    fields.forEach((field) => {
      if (response[field]) {
        params[field] = response[field];
      }
    });
    const res = await API.get(`/api/oauth/telegram/login`, { params });
    const { success, message, data } = res.data;
    if (success) {
      userDispatch({ type: 'login', payload: data });
      localStorage.setItem('user', JSON.stringify(data));
      showSuccess('登录成功！');
      setUserData(data);
      updateAPI();
      navigate('/');
    } else {
      showError(message);
    }
  };

  return (
    <div>
      <div className="min-h-screen flex flex-col">
        <header className="h-16"></header>
        <main className="flex-1 flex justify-center items-start mt-[120px]">
          <div className="w-[500px]">
            <div className="bg-card text-card-foreground rounded-lg border shadow-xs p-6">
              <h2 className="text-2xl font-bold text-center mb-6">{t('新用户注册')}</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="username">
                    {t('用户名')}
                  </label>
                  <input
                    id="username"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    name="username"
                    placeholder={t('用户名')}
                    value={inputs.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                    {t('密码')}
                  </label>
                  <input
                    id="password"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    name="password"
                    type="password"
                    placeholder={t('输入密码，最短 8 位，最长 20 位')}
                    value={inputs.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password2">
                    {t('重复密码')}
                  </label>
                  <input
                    id="password2"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    name="password2"
                    type="password"
                    placeholder={t('再次输入密码')}
                    value={inputs.password2}
                    onChange={(e) => handleChange('password2', e.target.value)}
                  />
                </div>

                {showEmailVerification && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                        {t('邮箱')}
                      </label>
                      <div className="flex">
                        <input
                          id="email"
                          className="flex-1 h-10 rounded-l-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          name="email"
                          placeholder={t('输入邮箱')}
                          value={inputs.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                        />
                        <button
                          className="h-10 rounded-r-md border border-l-0 border-input bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                          onClick={sendVerificationCode}
                          disabled={loading}
                        >
                          {t('获取验证码')}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="verification_code">
                        {t('验证码')}
                      </label>
                      <input
                        id="verification_code"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        name="verification_code"
                        placeholder={t('输入验证码')}
                        value={inputs.verification_code}
                        onChange={(e) => handleChange('verification_code', e.target.value)}
                      />
                    </div>
                  </>
                )}

                <button
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {t('注册')}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">{t('第三方登录')}</span>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  {status.github_oauth && (
                    <button 
                      className="rounded-full w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200"
                      onClick={() => onGitHubOAuthClicked(status.github_client_id, status.redirect_uri)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                    </button>
                  )}
                  
                  {status.oidc_oauth && (
                    <button 
                      className="rounded-full w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200"
                      onClick={() => onOIDCClicked(status.redirect_uri)}
                    >
                      <OIDCIcon />
                    </button>
                  )}
                  
                  {status.linuxdo_oauth && (
                    <button 
                      className="rounded-full w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200"
                      onClick={() => onLinuxDOOAuthClicked(status.linuxdo_client_id, status.redirect_uri)}
                    >
                      <LinuxDoIcon />
                    </button>
                  )}
                  
                  {status.wechat_login && (
                    <button 
                      className="rounded-full w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200"
                      onClick={onWeChatLoginClicked}
                    >
                      <WeChatIcon />
                    </button>
                  )}
                  
                  {status.telegram_login && status.telegram_bot_name !== '' && (
                    <div className="inline-block">
                      <TelegramLoginButton
                        dataOnauth={onTelegramLoginClicked}
                        botName={status.telegram_bot_name}
                      />
                    </div>
                  )}
                </div>
                
                <div className="text-center text-sm">
                  <span>{t('已有账号？')}</span>
                  <Link to="/login" className="text-primary hover:underline">
                    {t('登录')}
                  </Link>
                </div>
              </div>
            </div>
            
            {showWeChatLoginModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-background rounded-lg p-6 w-[400px] max-w-[90vw]">
                  <h3 className="text-lg font-medium mb-4">{t('微信扫码登录')}</h3>
                  <div className="flex flex-col items-center mb-4">
                    <img src={status.wechat_qrcode} alt="WeChat QR Code" className="max-w-full" />
                  </div>
                  <p className="text-center mb-4">
                    {t('微信扫码关注公众号，输入「验证码」获取验证码（三分钟内有效）')}
                  </p>
                  <div className="space-y-2 mb-4">
                    <label className="text-sm font-medium leading-none" htmlFor="wechat_code">
                      {t('验证码')}
                    </label>
                    <input
                      id="wechat_code"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder={t('验证码')}
                      value={inputs.wechat_verification_code || ''}
                      onChange={(e) => handleChange('wechat_verification_code', e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                      onClick={() => setShowWeChatLoginModal(false)}
                    >
                      {t('取消')}
                    </button>
                    <button 
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                      onClick={onSubmitWeChatVerificationCode}
                    >
                      {t('验证')}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {turnstileEnabled && (
              <div className="flex justify-center mt-5">
                <Turnstile
                  sitekey={turnstileSiteKey}
                  onVerify={(token) => {
                    setTurnstileToken(token);
                  }}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RegisterForm;
