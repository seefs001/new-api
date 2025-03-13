import {
  API,
  getLogo,
  showError,
  showInfo,
  showSuccess,
  updateAPI,
} from '../helpers';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Clock, Github } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import { onGitHubOAuthClicked, onLinuxDOOAuthClicked, onOIDCClicked } from './utils';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import LinuxDoIcon from './LinuxDoIcon.js';
import OIDCIcon from './OIDCIcon.js';
import { Separator } from '../components/ui/separator';
import TelegramLoginButton from 'react-telegram-login';
import Turnstile from 'react-turnstile';
import { UserContext } from '../context/User';
import WeChatIcon from './WeChatIcon';
import { cn } from '../lib/utils';
import { setUserData } from '../helpers/data.js';
import { useTranslation } from 'react-i18next';

const LoginForm = () => {
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
    wechat_verification_code: '',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const { username, password } = inputs;
  const [userState, userDispatch] = useContext(UserContext);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  let navigate = useNavigate();
  const [status, setStatus] = useState({});
  const [showWeChatLoginModal, setShowWeChatLoginModal] = useState(false);
  const { t } = useTranslation();

  const logo = getLogo();

  let affCode = new URLSearchParams(window.location.search).get('aff');
  if (affCode) {
    localStorage.setItem('aff', affCode);
  }

  useEffect(() => {
    if (searchParams.get('expired')) {
      showError(t('未登录或登录已过期，请重新登录'));
    }
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      setStatus(status);
      if (status.turnstile_check) {
        setTurnstileEnabled(true);
        setTurnstileSiteKey(status.turnstile_site_key);
      }
    }
  }, []);


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
    e.preventDefault();
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    setSubmitted(true);
    if (username && password) {
      const res = await API.post(
        `/api/user/login?turnstile=${turnstileToken}`,
        {
          username,
          password,
        },
      );
      const { success, message, data } = res.data;
      if (success) {
        userDispatch({ type: 'login', payload: data });
        setUserData(data);
        updateAPI();
        showSuccess('登录成功！');
        if (username === 'root' && password === '123456') {
          // Show error dialog instead of using Semi Modal
          showError('您正在使用默认密码！请立刻修改默认密码！');
        }
        navigate('/token');
      } else {
        showError(message);
      }
    } else {
      showError('请输入用户名和密码！');
    }
  }

  // 添加Telegram登录处理函数
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
    <div className="container mx-auto">
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">{t('用户登录')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t('用户名/邮箱')}</Label>
                  <Input
                    id="username"
                    placeholder={t('用户名/邮箱')}
                    value={username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('密码')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('密码')}
                    value={password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                  />
                </div>

                {turnstileEnabled && (
                  <div className="flex justify-center">
                    <Turnstile
                      sitekey={turnstileSiteKey}
                      onVerify={(token) => {
                        setTurnstileToken(token);
                      }}
                    />
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                >
                  {t('登录')}
                </Button>
              </form>

              <div className="flex justify-between mt-4 text-sm">
                <p>
                  {t('没有账户？')} <Link to="/register" className="text-primary hover:underline">{t('点击注册')}</Link>
                </p>
                <p>
                  {t('忘记密码？')} <Link to="/reset" className="text-primary hover:underline">{t('点击重置')}</Link>
                </p>
              </div>
            </CardContent>

            {(status.github_oauth ||
              status.oidc_enabled ||
              status.wechat_login ||
              status.telegram_oauth ||
              status.linuxdo_oauth) && (
              <CardFooter className="flex flex-col">
                <Separator className="my-4" />
                <p className="text-center text-sm text-muted-foreground mb-4">{t('第三方登录')}</p>
                <div className="flex justify-center gap-4">
                  {status.github_oauth && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onGitHubOAuthClicked(navigate)}
                      className="rounded-full"
                    >
                      <Github className="h-5 w-5" />
                    </Button>
                  )}
                  {status.oidc_enabled && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onOIDCClicked(navigate)}
                      className="rounded-full"
                    >
                      <OIDCIcon className="h-5 w-5" />
                    </Button>
                  )}
                  {status.wechat_login && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onWeChatLoginClicked}
                      className="rounded-full"
                    >
                      <WeChatIcon className="h-5 w-5" />
                    </Button>
                  )}
                  {status.linuxdo_oauth && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onLinuxDOOAuthClicked(navigate)}
                      className="rounded-full"
                    >
                      <LinuxDoIcon className="h-5 w-5" />
                    </Button>
                  )}
                </div>
                {status.telegram_oauth && (
                  <div className="mt-4 flex justify-center">
                    <TelegramLoginButton
                      dataOnauth={onTelegramLoginClicked}
                      botName={status.telegram_bot_name}
                    />
                  </div>
                )}
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
      
      <Dialog open={showWeChatLoginModal} onOpenChange={setShowWeChatLoginModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('微信登录验证')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="wechat_code">{t('验证码')}</Label>
              <Input
                id="wechat_code"
                placeholder={t('请输入验证码')}
                value={inputs.wechat_verification_code}
                onChange={(e) => handleChange('wechat_verification_code', e.target.value)}
              />
            </div>
            {turnstileEnabled && (
              <div className="flex justify-center">
                <Turnstile
                  sitekey={turnstileSiteKey}
                  onVerify={(token) => {
                    setTurnstileToken(token);
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWeChatLoginModal(false)}>
              {t('取消')}
            </Button>
            <Button onClick={onSubmitWeChatVerificationCode}>
              {t('确定')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginForm;
