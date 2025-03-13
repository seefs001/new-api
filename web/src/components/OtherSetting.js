import { API, showError, showSuccess, timestamp2string } from '../helpers';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from './ui/form';
import React, { useContext, useEffect, useRef, useState } from 'react';

// Shadcn UI components
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { StatusContext } from '../context/Status/index.js';
import { Textarea } from './ui/textarea';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';

const OtherSetting = () => {
  const { t } = useTranslation();
  let [inputs, setInputs] = useState({
    Notice: '',
    SystemName: '',
    Logo: '',
    Footer: '',
    About: '',
    HomePageContent: '',
  });
  let [loading, setLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [statusState, statusDispatch] = useContext(StatusContext);
  const [updateData, setUpdateData] = useState({
    tag_name: '',
    content: '',
  });

  const updateOption = async (key, value) => {
    setLoading(true);
    const res = await API.put('/api/option/', {
      key,
      value,
    });
    const { success, message } = res.data;
    if (success) {
      setInputs((inputs) => ({ ...inputs, [key]: value }));
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const [loadingInput, setLoadingInput] = useState({
    Notice: false,
    SystemName: false,
    Logo: false,
    HomePageContent: false,
    About: false,
    Footer: false,
    CheckUpdate: false
  });
  const handleInputChange = async (value, e) => {
    const name = e.target.id;
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  // 通用设置
  const formAPISettingGeneral = useRef();
  // 通用设置 - Notice
  const submitNotice = async () => {
    try {
      setLoadingInput((loadingInput) => ({ ...loadingInput, Notice: true }));
      await updateOption('Notice', inputs.Notice);
      showSuccess(t('公告已更新'));
    } catch (error) {
      console.error(t('公告更新失败'), error);
      showError(t('公告更新失败'));
    } finally {
      setLoadingInput((loadingInput) => ({ ...loadingInput, Notice: false }));
    }
  };
  // 个性化设置
  const formAPIPersonalization = useRef();
  //  个性化设置 - SystemName
  const submitSystemName = async () => {
    try {
      setLoadingInput((loadingInput) => ({
        ...loadingInput,
        SystemName: true,
      }));
      await updateOption('SystemName', inputs.SystemName);
      showSuccess(t('系统名称已更新'));
    } catch (error) {
      console.error(t('系统名称更新失败'), error);
      showError(t('系统名称更新失败'));
    } finally {
      setLoadingInput((loadingInput) => ({
        ...loadingInput,
        SystemName: false,
      }));
    }
  };

  // 个性化设置 - Logo
  const submitLogo = async () => {
    try {
      setLoadingInput((loadingInput) => ({ ...loadingInput, Logo: true }));
      await updateOption('Logo', inputs.Logo);
      showSuccess('Logo 已更新');
    } catch (error) {
      console.error('Logo 更新失败', error);
      showError('Logo 更新失败');
    } finally {
      setLoadingInput((loadingInput) => ({ ...loadingInput, Logo: false }));
    }
  };
  // 个性化设置 - 首页内容
  const submitOption = async (key) => {
    try {
      setLoadingInput((loadingInput) => ({
        ...loadingInput,
        HomePageContent: true,
      }));
      await updateOption(key, inputs[key]);
      showSuccess('首页内容已更新');
    } catch (error) {
      console.error('首页内容更新失败', error);
      showError('首页内容更新失败');
    } finally {
      setLoadingInput((loadingInput) => ({
        ...loadingInput,
        HomePageContent: false,
      }));
    }
  };
  // 个性化设置 - 关于
  const submitAbout = async () => {
    try {
      setLoadingInput((loadingInput) => ({ ...loadingInput, About: true }));
      await updateOption('About', inputs.About);
      showSuccess('关于内容已更新');
    } catch (error) {
      console.error('关于内容更新失败', error);
      showError('关于内容更新失败');
    } finally {
      setLoadingInput((loadingInput) => ({ ...loadingInput, About: false }));
    }
  };
  // 个性化设置 - 页脚
  const submitFooter = async () => {
    try {
      setLoadingInput((loadingInput) => ({ ...loadingInput, Footer: true }));
      await updateOption('Footer', inputs.Footer);
      showSuccess('页脚内容已更新');
    } catch (error) {
      console.error('页脚内容更新失败', error);
      showError('页脚内容更新失败');
    } finally {
      setLoadingInput((loadingInput) => ({ ...loadingInput, Footer: false }));
    }
  };

  const checkUpdate = async () => {
    try {
      setLoadingInput((loadingInput) => ({ ...loadingInput, CheckUpdate: true }));
      // Use a CORS proxy to avoid direct cross-origin requests to GitHub API
      // Option 1: Use a public CORS proxy service
      // const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      // const res = await API.get(
      //   `${proxyUrl}https://api.github.com/repos/Calcium-Ion/new-api/releases/latest`,
      // );
      
      // Option 2: Use the JSON proxy approach which often works better with GitHub API
      const res = await fetch(
        'https://api.github.com/repos/Calcium-Ion/new-api/releases/latest',
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            // Adding User-Agent which is often required by GitHub API
            'User-Agent': 'new-api-update-checker'
          }
        }
      ).then(response => response.json());
      
      // Option 3: Use a local proxy endpoint
      // Create a cached version of the response to avoid frequent GitHub API calls
      // const res = await API.get('/api/status/github-latest-release');

      const { tag_name, body } = res;
      if (tag_name === statusState?.status?.version) {
        showSuccess(`已是最新版本：${tag_name}`);
      } else {
        setUpdateData({
          tag_name: tag_name,
          content: marked.parse(body),
        });
        setShowUpdateModal(true);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      showError('检查更新失败，请稍后再试');
    } finally {
      setLoadingInput((loadingInput) => ({ ...loadingInput, CheckUpdate: false }));
    }
  };
  const getOptions = async () => {
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (success) {
      let newInputs = {};
      data.forEach((item) => {
        if (item.key in inputs) {
          newInputs[item.key] = item.value;
        }
      });
      setInputs(newInputs);
      formAPISettingGeneral.current.setValues(newInputs);
      formAPIPersonalization.current.setValues(newInputs);
    } else {
      showError(message);
    }
  };

  useEffect(() => {
    getOptions();
  }, []);

  // Function to open GitHub release page
  const openGitHubRelease = () => {
    window.open(`https://github.com/Calcium-Ion/new-api/releases/tag/${updateData.tag_name}`, '_blank');
  };

  const getStartTimeString = () => {
    const timestamp = statusState?.status?.start_time;
    return statusState.status ? timestamp2string(timestamp) : '';
  };

  return (
    <div className="space-y-6">
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t('其他设置')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="SystemName">{t('系统名称')}</Label>
              <div className="flex space-x-2">
                <Input
                  id="SystemName"
                  placeholder={t('在此输入系统名称')}
                  value={inputs.SystemName}
                  onChange={(e) => handleInputChange(e.target.value, { target: { id: 'SystemName' } })}
                  className="flex-1"
                />
                <Button 
                  onClick={submitSystemName} 
                  disabled={loadingInput['SystemName']}
                >
                  {loadingInput['SystemName'] ? t('保存中...') : t('设置系统名称')}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="Logo">{t('Logo 图片地址')}</Label>
              <div className="flex space-x-2">
                <Input
                  id="Logo"
                  placeholder={t('在此输入 Logo 图片地址')}
                  value={inputs.Logo}
                  onChange={(e) => handleInputChange(e.target.value, { target: { id: 'Logo' } })}
                  className="flex-1"
                />
                <Button 
                  onClick={submitLogo} 
                  disabled={loadingInput['Logo']}
                >
                  {loadingInput['Logo'] ? t('保存中...') : t('设置 Logo')}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="Notice">{t('公告')}</Label>
              <Textarea
                id="Notice"
                placeholder={t('在此输入新的公告，支持 Markdown & HTML 代码')}
                value={inputs.Notice}
                onChange={(e) => handleInputChange(e.target.value, { target: { id: 'Notice' } })}
                className="min-h-[150px] font-mono"
              />
              <Button 
                onClick={submitNotice} 
                disabled={loadingInput['Notice']}
              >
                {loadingInput['Notice'] ? t('保存中...') : t('设置公告')}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="HomePageContent">{t('首页内容')}</Label>
              <Textarea
                id="HomePageContent"
                placeholder={t('在此输入首页内容，支持 Markdown & HTML 代码，设置后首页的状态信息将不再显示。如果输入的是一个链接，则会使用该链接作为 iframe 的 src 属性，这允许你设置任意网页作为首页')}
                value={inputs.HomePageContent}
                onChange={(e) => handleInputChange(e.target.value, { target: { id: 'HomePageContent' } })}
                className="min-h-[150px] font-mono"
              />
              <Button 
                onClick={() => submitOption('HomePageContent')} 
                disabled={loadingInput['HomePageContent']}
              >
                {loadingInput['HomePageContent'] ? t('保存中...') : t('设置首页内容')}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="About">{t('关于')}</Label>
              <Textarea
                id="About"
                placeholder={t('在此输入新的关于内容，支持 Markdown & HTML 代码。如果输入的是一个链接，则会使用该链接作为 iframe 的 src 属性，这允许你设置任意网页作为关于页面')}
                value={inputs.About}
                onChange={(e) => handleInputChange(e.target.value, { target: { id: 'About' } })}
                className="min-h-[150px] font-mono"
              />
              <Button 
                onClick={submitAbout} 
                disabled={loadingInput['About']}
              >
                {loadingInput['About'] ? t('保存中...') : t('设置关于')}
              </Button>
            </div>

            <Alert className="my-4">
              <AlertDescription>
                {t('移除 One API 的版权标识必须首先获得授权，项目维护需要花费大量精力，如果本项目对你有意义，请主动支持本项目')}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="Footer">{t('页脚')}</Label>
              <div className="flex space-x-2">
                <Input
                  id="Footer"
                  placeholder={t('在此输入新的页脚，留空则使用默认页脚，支持 HTML 代码')}
                  value={inputs.Footer}
                  onChange={(e) => handleInputChange(e.target.value, { target: { id: 'Footer' } })}
                  className="flex-1"
                />
                <Button 
                  onClick={submitFooter} 
                  disabled={loadingInput['Footer']}
                >
                  {loadingInput['Footer'] ? t('保存中...') : t('设置页脚')}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('新版本') + '：' + updateData.tag_name}</DialogTitle>
          </DialogHeader>
          <div dangerouslySetInnerHTML={{ __html: updateData.content }}></div>
          <DialogFooter>
            <Button 
              onClick={() => {
                setShowUpdateModal(false);
                openGitHubRelease();
              }}
            >
              {t('详情')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OtherSetting;
