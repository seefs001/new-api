import { API, showError, showSuccess } from '../helpers';
import { Card, CardContent } from '../components/ui/card';
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

import GroupRatioSettings from '../pages/Setting/Operation/GroupRatioSettings.js';
import { Loader2 } from 'lucide-react';
import ModelRatioNotSetEditor from '../pages/Setting/Operation/ModelRationNotSetEditor.js';
import ModelRatioSettings from '../pages/Setting/Operation/ModelRatioSettings.js';
import ModelSettingsVisualEditor from '../pages/Setting/Operation/ModelSettingsVisualEditor.js';
import SettingsChats from '../pages/Setting/Operation/SettingsChats.js';
import SettingsCreditLimit from '../pages/Setting/Operation/SettingsCreditLimit.js';
import SettingsDataDashboard from '../pages/Setting/Operation/SettingsDataDashboard.js';
import SettingsDrawing from '../pages/Setting/Operation/SettingsDrawing.js';
import SettingsGeneral from '../pages/Setting/Operation/SettingsGeneral.js';
import SettingsLog from '../pages/Setting/Operation/SettingsLog.js';
import SettingsMonitoring from '../pages/Setting/Operation/SettingsMonitoring.js';
import SettingsSensitiveWords from '../pages/Setting/Operation/SettingsSensitiveWords.js';
import { useTranslation } from 'react-i18next';

const OperationSetting = () => {
  const { t } = useTranslation();
  let [inputs, setInputs] = useState({
    QuotaForNewUser: 0,
    QuotaForInviter: 0,
    QuotaForInvitee: 0,
    QuotaRemindThreshold: 0,
    PreConsumedQuota: 0,
    StreamCacheQueueLength: 0,
    ModelRatio: '',
    CacheRatio: '',
    CompletionRatio: '',
    ModelPrice: '',
    GroupRatio: '',
    UserUsableGroups: '',
    TopUpLink: '',
    'general_setting.docs_link': '',
    // ChatLink2: '', // 添加的新状态变量
    QuotaPerUnit: 0,
    AutomaticDisableChannelEnabled: false,
    AutomaticEnableChannelEnabled: false,
    ChannelDisableThreshold: 0,
    LogConsumeEnabled: false,
    DisplayInCurrencyEnabled: false,
    DisplayTokenStatEnabled: false,
    CheckSensitiveEnabled: false,
    CheckSensitiveOnPromptEnabled: false,
    CheckSensitiveOnCompletionEnabled: '',
    StopOnSensitiveEnabled: '',
    SensitiveWords: '',
    MjNotifyEnabled: false,
    MjAccountFilterEnabled: false,
    MjModeClearEnabled: false,
    MjForwardUrlEnabled: false,
    MjActionCheckSuccessEnabled: false,
    DrawingEnabled: false,
    DataExportEnabled: false,
    DataExportDefaultTime: 'hour',
    DataExportInterval: 5,
    DefaultCollapseSidebar: false, // 默认折叠侧边栏
    RetryTimes: 0,
    Chats: "[]",
    DemoSiteEnabled: false,
    SelfUseModeEnabled: false,
    AutomaticDisableKeywords: '',
  });

  let [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("model");

  const getOptions = async () => {
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (success) {
      let newInputs = {};
      data.forEach((item) => {
        if (
          item.key === 'ModelRatio' ||
          item.key === 'GroupRatio' ||
          item.key === 'UserUsableGroups' ||
          item.key === 'CompletionRatio' ||
          item.key === 'ModelPrice' ||
          item.key === 'CacheRatio'
        ) {
          item.value = JSON.stringify(JSON.parse(item.value), null, 2);
        }
        if (
          item.key.endsWith('Enabled') ||
          ['DefaultCollapseSidebar'].includes(item.key)
        ) {
          newInputs[item.key] = item.value === 'true' ? true : false;
        } else {
          newInputs[item.key] = item.value;
        }
      });

      setInputs(newInputs);
    } else {
      showError(message);
    }
  };
  
  async function onRefresh() {
    try {
      setLoading(true);
      await getOptions();
      // showSuccess('刷新成功');
    } catch (error) {
      showError('刷新失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {!loading && (
        <>
          {/* 通用设置 */}
          <Card className="mt-4">
            <CardContent className="p-6">
              <SettingsGeneral options={inputs} refresh={onRefresh} />
            </CardContent>
          </Card>
          
          {/* 绘图设置 */}
          <Card className="mt-4">
            <CardContent className="p-6">
              <SettingsDrawing options={inputs} refresh={onRefresh} />
            </CardContent>
          </Card>
          
          {/* 屏蔽词过滤设置 */}
          <Card className="mt-4">
            <CardContent className="p-6">
              <SettingsSensitiveWords options={inputs} refresh={onRefresh} />
            </CardContent>
          </Card>
          
          {/* 日志设置 */}
          <Card className="mt-4">
            <CardContent className="p-6">
              <SettingsLog options={inputs} refresh={onRefresh} />
            </CardContent>
          </Card>
          
          {/* 数据看板 */}
          <Card className="mt-4">
            <CardContent className="p-6">
              <SettingsDataDashboard options={inputs} refresh={onRefresh} />
            </CardContent>
          </Card>
          
          {/* 监控设置 */}
          <Card className="mt-4">
            <CardContent className="p-6">
              <SettingsMonitoring options={inputs} refresh={onRefresh} />
            </CardContent>
          </Card>
          
          {/* 额度设置 */}
          <Card className="mt-4">
            <CardContent className="p-6">
              <SettingsCreditLimit options={inputs} refresh={onRefresh} />
            </CardContent>
          </Card>
          
          {/* 聊天设置 */}
          <Card className="mt-4">
            <CardContent className="p-6">
              <SettingsChats options={inputs} refresh={onRefresh} />
            </CardContent>
          </Card>
          
          {/* 分组倍率设置 */}
          <Card className="mt-4">
            <CardContent className="p-6">
              <GroupRatioSettings options={inputs} refresh={onRefresh} />
            </CardContent>
          </Card>
          
          {/* 合并模型倍率设置和可视化倍率设置 */}
          <Card className="mt-4">
            <CardContent className="p-6">
              <Tabs defaultValue="model" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="model">{t('模型倍率设置')}</TabsTrigger>
                  <TabsTrigger value="visual">{t('可视化倍率设置')}</TabsTrigger>
                  <TabsTrigger value="unset_models">{t('未设置倍率模型')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="model">
                  <ModelRatioSettings options={inputs} refresh={onRefresh} />
                </TabsContent>
                
                <TabsContent value="visual">
                  <ModelSettingsVisualEditor options={inputs} refresh={onRefresh} />
                </TabsContent>
                
                <TabsContent value="unset_models">
                  <ModelRatioNotSetEditor options={inputs} refresh={onRefresh} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default OperationSetting;
