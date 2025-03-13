import {
    API,
    copy,
    isRoot,
    showError,
    showInfo,
    showSuccess,
} from '../helpers';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
    AlertCircle,
    ChevronDown,
    Clipboard,
    Copy,
    ImageIcon,
    Minus,
    Plus
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from './ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './ui/form';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import React, {useContext, useEffect, useState} from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from './ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from './ui/tabs';
import {
    getQuotaPerUnit,
    renderQuota,
    renderQuotaWithPrompt,
    stringToColor,
} from '../helpers/render';
import {onGitHubOAuthClicked, onLinuxDOOAuthClicked, onOIDCClicked} from './utils';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from "./ui/label";
import { Separator } from './ui/separator';
import TelegramLoginButton from 'react-telegram-login';
import Turnstile from 'react-turnstile';
import { Typography } from './ui/typography';
import {UserContext} from '../context/User';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PersonalSetting = () => {
    const [userState, userDispatch] = useContext(UserContext);
    let navigate = useNavigate();
    const { t } = useTranslation();

    const [inputs, setInputs] = useState({
        wechat_verification_code: '',
        email_verification_code: '',
        email: '',
        self_account_deletion_confirmation: '',
        set_new_password: '',
        set_new_password_confirmation: '',
    });
    const [status, setStatus] = useState({});
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showWeChatBindModal, setShowWeChatBindModal] = useState(false);
    const [showEmailBindModal, setShowEmailBindModal] = useState(false);
    const [showAccountDeleteModal, setShowAccountDeleteModal] = useState(false);
    const [showCopyErrorDialog, setShowCopyErrorDialog] = useState(false);
    const [copyErrorText, setCopyErrorText] = useState('');
    const [turnstileEnabled, setTurnstileEnabled] = useState(false);
    const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [disableButton, setDisableButton] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [affLink, setAffLink] = useState('');
    const [systemToken, setSystemToken] = useState('');
    const [models, setModels] = useState([]);
    const [openTransfer, setOpenTransfer] = useState(false);
    const [transferAmount, setTransferAmount] = useState(0);
    const [isModelsExpanded, setIsModelsExpanded] = useState(() => {
        // Initialize from localStorage if available
        const savedState = localStorage.getItem('modelsExpanded');
        return savedState ? JSON.parse(savedState) : false;
    });
    const MODELS_DISPLAY_COUNT = 10;  // 默认显示的模型数量
    const [notificationSettings, setNotificationSettings] = useState({
        warningType: 'email',
        warningThreshold: 100000,
        webhookUrl: '',
        webhookSecret: '',
        notificationEmail: ''
    });
    const [showWebhookDocs, setShowWebhookDocs] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [affiliateEnabled, setAffiliateEnabled] = useState(false);
    const [editorHeight, setEditorHeight] = useState('300px');
    const [quota, setQuota] = useState(0);
    const [submitEnabled, setSubmitEnabled] = useState(false);

    const profileForm = useForm({
        defaultValues: {
            username: '',
            display_name: '',
            email: '',
            wechat_id: '',
            phone: '',
            github_id: '',
            telegram_id: '',
            notice: '',
        }
    });

    const passwordForm = useForm({
        defaultValues: {
            old_password: '',
            new_password: '',
            confirm_password: '',
        }
    });

    const optionsForm = useForm({
        defaultValues: {
            openai_provider: '',
        }
    });

    const affiliateForm = useForm({
        defaultValues: {
            affiliate_code: '',
        }
    });

    useEffect(() => {
        let status = localStorage.getItem('status');
        if (status) {
            status = JSON.parse(status);
            setStatus(status);
            if (status.turnstile_check) {
                setTurnstileEnabled(true);
                setTurnstileSiteKey(status.turnstile_site_key);
            }
        }
        getUserData().then((res) => {
            console.log(userState);
        });
        loadModels().then();
        getAffLink().then();
        setTransferAmount(getQuotaPerUnit());
    }, []);

    useEffect(() => {
        let countdownInterval = null;
        if (disableButton && countdown > 0) {
            countdownInterval = setInterval(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else if (countdown === 0) {
            setDisableButton(false);
            setCountdown(30);
        }
        return () => clearInterval(countdownInterval); // Clean up on unmount
    }, [disableButton, countdown]);

    useEffect(() => {
        if (userState?.user?.setting) {
            const settings = JSON.parse(userState.user.setting);
            setNotificationSettings({
                warningType: settings.notify_type || 'email',
                warningThreshold: settings.quota_warning_threshold || 500000,
                webhookUrl: settings.webhook_url || '',
                webhookSecret: settings.webhook_secret || '',
                notificationEmail: settings.notification_email || ''
            });
        }
    }, [userState?.user?.setting]);

    // Save models expanded state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('modelsExpanded', JSON.stringify(isModelsExpanded));
    }, [isModelsExpanded]);

    const handleInputChange = (name, value) => {
        setInputs((inputs) => ({...inputs, [name]: value}));
    };

    const generateAccessToken = async () => {
        const res = await API.get('/api/user/token');
        const {success, message, data} = res.data;
        if (success) {
            setSystemToken(data);
            await copy(data);
            showSuccess(t('令牌已重置并已复制到剪贴板'));
        } else {
            showError(message);
        }
    };

    const getAffLink = async () => {
        const res = await API.get('/api/user/aff');
        const {success, message, data} = res.data;
        if (success) {
            let link = `${window.location.origin}/register?aff=${data}`;
            setAffLink(link);
        } else {
            showError(message);
        }
    };

    const getUserData = async () => {
        let res = await API.get(`/api/user/self`);
        const {success, message, data} = res.data;
        if (success) {
            userDispatch({type: 'login', payload: data});
        } else {
            showError(message);
        }
    };

    const loadModels = async () => {
        let res = await API.get(`/api/user/models`);
        const {success, message, data} = res.data;
        if (success) {
            if (data != null) {
                setModels(data);
            }
        } else {
            showError(message);
        }
    };

    const handleAffLinkClick = async (e) => {
        e.target.select();
        await copy(e.target.value);
        showSuccess(t('邀请链接已复制到剪切板'));
    };

    const handleSystemTokenClick = async (e) => {
        e.target.select();
        await copy(e.target.value);
        showSuccess(t('系统令牌已复制到剪切板'));
    };

    const deleteAccount = async () => {
        if (inputs.self_account_deletion_confirmation !== userState.user.username) {
            showError(t('请输入你的账户名以确认删除！'));
            return;
        }

        const res = await API.delete('/api/user/self');
        const {success, message} = res.data;

        if (success) {
            showSuccess(t('账户已删除！'));
            await API.get('/api/user/logout');
            userDispatch({type: 'logout'});
            localStorage.removeItem('user');
            navigate('/login');
        } else {
            showError(message);
        }
    };

    const bindWeChat = async () => {
        if (inputs.wechat_verification_code === '') return;
        const res = await API.get(
            `/api/oauth/wechat/bind?code=${inputs.wechat_verification_code}`,
        );
        const {success, message} = res.data;
        if (success) {
            showSuccess(t('微信账户绑定成功！'));
            setShowWeChatBindModal(false);
        } else {
            showError(message);
        }
    };

    const changePassword = async () => {
        if (inputs.set_new_password !== inputs.set_new_password_confirmation) {
            showError(t('两次输入的密码不一致！'));
            return;
        }
        const res = await API.put(`/api/user/self`, {
            password: inputs.set_new_password,
        });
        const {success, message} = res.data;
        if (success) {
            showSuccess(t('密码修改成功！'));
            setShowWeChatBindModal(false);
        } else {
            showError(message);
        }
        setShowChangePasswordModal(false);
    };

    const transfer = async () => {
        if (transferAmount < getQuotaPerUnit()) {
            showError(t('划转金额最低为') + ' ' + renderQuota(getQuotaPerUnit()));
            return;
        }
        const res = await API.post(`/api/user/aff_transfer`, {
            quota: transferAmount,
        });
        const {success, message} = res.data;
        if (success) {
            showSuccess(message);
            setOpenTransfer(false);
            getUserData().then();
        } else {
            showError(message);
        }
    };

    const sendVerificationCode = async () => {
        if (inputs.email === '') {
            showError(t('请输入邮箱！'));
            return;
        }
        setDisableButton(true);
        if (turnstileEnabled && turnstileToken === '') {
            showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
            return;
        }
        setLoading(true);
        const res = await API.get(
            `/api/verification?email=${inputs.email}&turnstile=${turnstileToken}`,
        );
        const {success, message} = res.data;
        if (success) {
            showSuccess(t('验证码发送成功，请检查邮箱！'));
        } else {
            showError(message);
        }
        setLoading(false);
    };

    const bindEmail = async () => {
        if (inputs.email_verification_code === '') {
            showError(t('请输入邮箱验证码！'));
            return;
        }
        setLoading(true);
        const res = await API.get(
            `/api/oauth/email/bind?email=${inputs.email}&code=${inputs.email_verification_code}`,
        );
        const {success, message} = res.data;
        if (success) {
            showSuccess(t('邮箱账户绑定成功！'));
            setShowEmailBindModal(false);
            userState.user.email = inputs.email;
        } else {
            showError(message);
        }
        setLoading(false);
    };

    const getUsername = () => {
        if (userState.user) {
            return userState.user.username;
        } else {
            return 'null';
        }
    };

    const handleCancel = () => {
        setOpenTransfer(false);
    };

    const showErrorDialog = (title, content) => {
        setCopyErrorText(content);
        setShowCopyErrorDialog(true);
    };

    const copyText = async (text) => {
        if (await copy(text)) {
            showSuccess(t('已复制到剪贴板！'));
        } else {
            showErrorDialog(t('无法复制到剪贴板，请手动复制'), text);
        }
    };

    const handleNotificationSettingChange = (type, value) => {
        setNotificationSettings(prev => ({
            ...prev,
            [type]: value.target ? value.target.value : value  // 处理 Radio 事件对象
        }));
    };

    const saveNotificationSettings = async () => {
        try {
            const res = await API.put('/api/user/setting', {
                notify_type: notificationSettings.warningType,
                quota_warning_threshold: parseFloat(notificationSettings.warningThreshold),
                webhook_url: notificationSettings.webhookUrl,
                webhook_secret: notificationSettings.webhookSecret,
                notification_email: notificationSettings.notificationEmail
            });
            
            if (res.data.success) {
                showSuccess(t('通知设置已更新'));
                await getUserData();
            } else {
                showError(res.data.message);
            }
        } catch (error) {
            showError(t('更新通知设置失败'));
        }
    };

    const getOptions = async () => {
        let res = await API.get('/api/user/option');
        const { success, message, data } = res.data;
        if (success) {
            if (data.openai_provider) {
                optionsForm.setValue('openai_provider', data.openai_provider);
            }
        } else {
            showError(message);
        }
    };

    const loadUserInfo = async () => {
        try {
            let res = await API.get('/api/user/self');
            const { success, message, data } = res.data;
            if (success) {
                if (data) {
                    userDispatch({type: 'login', payload: data});
                    setAffiliateEnabled(data.affiliate_enabled);
                    profileForm.setValue('username', data.username || '');
                    profileForm.setValue('display_name', data.display_name || '');
                    profileForm.setValue('email', data.email || '');
                    profileForm.setValue('wechat_id', data.wechat_id || '');
                    profileForm.setValue('telegram_id', data.telegram_id || '');
                    profileForm.setValue('github_id', data.github_id || '');
                    profileForm.setValue('phone', data.phone || '');
                    profileForm.setValue('notice', data.notice || '');
                    affiliateForm.setValue('affiliate_code', data.affiliate_code || '');
                    setQuota(data.quota);
                }
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error.message);
        }
    };

    const onUpdateProfile = async (values) => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await API.put('/api/user/self', values);
            const { success, message } = res.data;
            if (success) {
                showSuccess('个人信息更新成功！');
                await loadUserInfo();
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const onUpdatePassword = async (values) => {
        if (loading) return;
        if (values.new_password !== values.confirm_password) {
            showError('两次输入的密码不一致！');
            return;
        }
        setLoading(true);
        try {
            const res = await API.put('/api/user/self/password', {
                password: values.old_password,
                new_password: values.new_password,
            });
            const { success, message } = res.data;
            if (success) {
                showSuccess('密码更新成功！');
                passwordForm.reset({
                    old_password: '',
                    new_password: '',
                    confirm_password: '',
                });
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const onUpdateOptions = async (values) => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await API.put('/api/user/option', values);
            const { success, message } = res.data;
            if (success) {
                showSuccess('偏好设置更新成功！');
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const copyAffiliateCode = () => {
        copy(userState.user.affiliate_code);
        showSuccess('推广码已复制到剪贴板！');
    };

    const copyAffiliateUrl = () => {
        const url = `${window.location.origin}/register?code=${userState.user.affiliate_code}`;
        copy(url);
        showSuccess('推广链接已复制到剪贴板！');
    };

    return (
        <div className="container mx-auto py-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile">{t('个人信息')}</TabsTrigger>
                    <TabsTrigger value="password">{t('修改密码')}</TabsTrigger>
                    <TabsTrigger value="options">{t('偏好设置')}</TabsTrigger>
                    {affiliateEnabled && (
                        <TabsTrigger value="affiliate">{t('推广计划')}</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('个人信息')}</CardTitle>
                            <CardDescription>
                                {t('在这里修改您的个人信息')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={profileForm.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('用户名')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} disabled />
                                                    </FormControl>
                                                    <FormDescription>
                                                        {t('用户名不可修改')}
                                                    </FormDescription>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="display_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('显示名称')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        {t('用于展示的名称')}
                                                    </FormDescription>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('电子邮件')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="wechat_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('微信号')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="telegram_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('Telegram')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="github_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('GitHub ID')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('手机号')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="col-span-1 md:col-span-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Label>{t('剩余额度')}</Label>
                                                <Badge variant="outline" className="text-sm">{renderQuota(quota)}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? t('保存中...') : t('保存修改')}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="password" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('修改密码')}</CardTitle>
                            <CardDescription>
                                {t('在这里修改您的账号密码')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
                                    <FormField
                                        control={passwordForm.control}
                                        name="old_password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('当前密码')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="password" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={passwordForm.control}
                                        name="new_password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('新密码')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="password" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={passwordForm.control}
                                        name="confirm_password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('确认新密码')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="password" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={loading}>
                                        {loading ? t('更新中...') : t('更新密码')}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="options" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('偏好设置')}</CardTitle>
                            <CardDescription>
                                {t('在这里设置您的使用偏好')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...optionsForm}>
                                <form onSubmit={optionsForm.handleSubmit(onUpdateOptions)} className="space-y-4">
                                    <FormField
                                        control={optionsForm.control}
                                        name="openai_provider"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('OpenAI 接口提供商')}</FormLabel>
                                                <Select 
                                                    onValueChange={field.onChange} 
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('请选择提供商')} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="">默认</SelectItem>
                                                        <SelectItem value="anthropic">Anthropic</SelectItem>
                                                        <SelectItem value="azure">Azure</SelectItem>
                                                        <SelectItem value="baidu">Baidu</SelectItem>
                                                        <SelectItem value="claude">Claude</SelectItem>
                                                        <SelectItem value="cloudflare">Cloudflare</SelectItem>
                                                        <SelectItem value="groq">Groq</SelectItem>
                                                        <SelectItem value="google">Google</SelectItem>
                                                        <SelectItem value="mistral">Mistral</SelectItem>
                                                        <SelectItem value="moonshot">Moonshot</SelectItem>
                                                        <SelectItem value="openai">OpenAI</SelectItem>
                                                        <SelectItem value="openrouter">OpenRouter</SelectItem>
                                                        <SelectItem value="perplexity">Perplexity</SelectItem>
                                                        <SelectItem value="zhipu">ZhipuAI</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    {t('自定义偏好的提供商')}
                                                </FormDescription>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={loading}>
                                        {loading ? t('保存中...') : t('保存偏好')}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {affiliateEnabled && (
                    <TabsContent value="affiliate" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('推广计划')}</CardTitle>
                                <CardDescription>
                                    {t('通过推广链接邀请新用户注册，获取奖励')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>{t('您的推广码')}</Label>
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            value={userState.user.affiliate_code || ''} 
                                            readOnly 
                                            className="font-mono"
                                        />
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            onClick={copyAffiliateCode}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('推广链接')}</Label>
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            value={`${window.location.origin}/register?code=${userState.user.affiliate_code || ''}`} 
                                            readOnly 
                                            className="font-mono"
                                        />
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            onClick={copyAffiliateUrl}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">{t('推广规则')}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t('每当有用户通过您的推广链接注册并消费，您将获得相应的奖励。')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {t('奖励将直接添加到您的账户额度中。')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>

            {/* Error Dialog for copy failures */}
            <Dialog open={showCopyErrorDialog} onOpenChange={setShowCopyErrorDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('无法复制到剪贴板，请手动复制')}</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 bg-muted rounded-md">
                        <pre className="text-sm break-all whitespace-pre-wrap">{copyErrorText}</pre>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowCopyErrorDialog(false)}>
                            {t('关闭')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* WeChat Bind Dialog */}
            <Dialog open={showWeChatBindModal} onOpenChange={setShowWeChatBindModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('绑定微信账号')}</DialogTitle>
                        <DialogDescription>
                            {t('请输入微信验证码进行账号绑定')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="wechat_verification_code">{t('微信验证码')}</Label>
                            <Input
                                id="wechat_verification_code"
                                value={inputs.wechat_verification_code}
                                onChange={(e) => handleInputChange('wechat_verification_code', e.target.value)}
                                placeholder={t('请输入微信验证码')}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowWeChatBindModal(false)}>
                            {t('取消')}
                        </Button>
                        <Button onClick={bindWeChat}>
                            {t('绑定')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Email Bind Dialog */}
            <Dialog open={showEmailBindModal} onOpenChange={setShowEmailBindModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('绑定邮箱账号')}</DialogTitle>
                        <DialogDescription>
                            {t('请输入邮箱地址和验证码进行账号绑定')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('邮箱地址')}</Label>
                            <Input
                                id="email"
                                value={inputs.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder={t('请输入邮箱地址')}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="flex-1">
                                <Label htmlFor="email_verification_code">{t('验证码')}</Label>
                                <Input
                                    id="email_verification_code"
                                    value={inputs.email_verification_code}
                                    onChange={(e) => handleInputChange('email_verification_code', e.target.value)}
                                    placeholder={t('请输入验证码')}
                                />
                            </div>
                            <div className="pt-6">
                                <Button 
                                    variant="outline" 
                                    onClick={sendVerificationCode}
                                    disabled={disableButton || inputs.email === ''}
                                >
                                    {disableButton ? `${countdown}s` : t('发送验证码')}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEmailBindModal(false)}>
                            {t('取消')}
                        </Button>
                        <Button onClick={bindEmail} disabled={loading}>
                            {loading ? t('绑定中...') : t('绑定')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('修改密码')}</DialogTitle>
                        <DialogDescription>
                            {t('输入新密码并确认')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="set_new_password">{t('新密码')}</Label>
                            <Input
                                id="set_new_password"
                                type="password"
                                value={inputs.set_new_password}
                                onChange={(e) => handleInputChange('set_new_password', e.target.value)}
                                placeholder={t('请输入新密码')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="set_new_password_confirmation">{t('确认新密码')}</Label>
                            <Input
                                id="set_new_password_confirmation"
                                type="password"
                                value={inputs.set_new_password_confirmation}
                                onChange={(e) => handleInputChange('set_new_password_confirmation', e.target.value)}
                                placeholder={t('请再次输入新密码')}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowChangePasswordModal(false)}>
                            {t('取消')}
                        </Button>
                        <Button onClick={changePassword}>
                            {t('修改')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Account Delete Dialog */}
            <AlertDialog open={showAccountDeleteModal} onOpenChange={setShowAccountDeleteModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-500">{t('删除账户')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('此操作将永久删除您的账户，所有数据将无法恢复。确认删除请输入 "DELETE" 后点击删除按钮。')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Input
                            value={inputs.self_account_deletion_confirmation}
                            onChange={(e) => handleInputChange('self_account_deletion_confirmation', e.target.value)}
                            placeholder={t('请输入 "DELETE" 确认')}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowAccountDeleteModal(false)}>
                            {t('取消')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={deleteAccount}
                        >
                            {t('删除')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default PersonalSetting;
