import { API, showError, showSuccess } from '../helpers';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import React, { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';
import SettingClaudeModel from '../pages/Setting/Model/SettingClaudeModel.js';
import SettingGeminiModel from '../pages/Setting/Model/SettingGeminiModel.js';
import SettingGlobalModel from '../pages/Setting/Model/SettingGlobalModel.js';
import { useTranslation } from 'react-i18next';

const ModelSetting = () => {
  const { t } = useTranslation();
  let [inputs, setInputs] = useState({
    'gemini.safety_settings': '',
    'gemini.version_settings': '',
    'claude.model_headers_settings': '',
    'claude.thinking_adapter_enabled': true,
    'claude.default_max_tokens': '',
    'claude.thinking_adapter_budget_tokens_percentage': 0.8,
    'global.pass_through_request_enabled': false,
  });

  let [loading, setLoading] = useState(false);

  const getOptions = async () => {
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (success) {
      let newInputs = {};
      data.forEach((item) => {
        if (
          item.key === 'gemini.safety_settings' ||
          item.key === 'gemini.version_settings' ||
          item.key === 'claude.model_headers_settings'||
          item.key === 'claude.default_max_tokens'
        ) {
          item.value = JSON.stringify(JSON.parse(item.value), null, 2);
        }
        if (
          item.key.endsWith('Enabled') || item.key.endsWith('enabled')
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
    <div className="space-y-8">
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {!loading && (
        <>
          {/* Global */}
          <Card>
            <CardHeader>
              <CardTitle>{t('全局模型设置')}</CardTitle>
            </CardHeader>
            <CardContent>
              <SettingGlobalModel options={inputs} refresh={onRefresh} />
            </CardContent>
          </Card>
          
          {/* Gemini */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Gemini模型设置')}</CardTitle>
            </CardHeader>
            <CardContent>
              <SettingGeminiModel options={inputs} refresh={onRefresh} />
            </CardContent>
          </Card>
          
          {/* Claude */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Claude模型设置')}</CardTitle>
            </CardHeader>
            <CardContent>
              <SettingClaudeModel options={inputs} refresh={onRefresh} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ModelSetting;
