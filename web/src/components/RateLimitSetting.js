import { API, showError, showSuccess } from '../helpers';
import { Card, CardContent } from '../components/ui/card';
import React, { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';
import RequestRateLimit from '../pages/Setting/RateLimit/SettingsRequestRateLimit.js';
import { useTranslation } from 'react-i18next';

const RateLimitSetting = () => {
  const { t } = useTranslation();
  let [inputs, setInputs] = useState({
    ModelRequestRateLimitEnabled: false,
    ModelRequestRateLimitCount: 0,
    ModelRequestRateLimitSuccessCount: 1000,
    ModelRequestRateLimitDurationMinutes: 1,
  });

  let [loading, setLoading] = useState(false);

  const getOptions = async () => {
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (success) {
      let newInputs = {};
      data.forEach((item) => {
        if (
          item.key.endsWith('Enabled')
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
        <Card className="mt-4">
          <CardContent className="p-6">
            <RequestRateLimit options={inputs} refresh={onRefresh} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RateLimitSetting;
