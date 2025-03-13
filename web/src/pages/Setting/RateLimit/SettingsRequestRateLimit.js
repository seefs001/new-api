import {
  API,
  compareObjects,
  showError,
  showSuccess,
  showWarning,
} from '../../../helpers';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Loader2 } from 'lucide-react';
import { Switch } from '../../../components/ui/switch';
import { useTranslation } from 'react-i18next';

export default function RequestRateLimit(props) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    ModelRequestRateLimitEnabled: false,
    ModelRequestRateLimitCount: -1,
    ModelRequestRateLimitSuccessCount: 1000,
    ModelRequestRateLimitDurationMinutes: 1
  });
  const formRef = useRef();
  const [inputsRow, setInputsRow] = useState(inputs);

  function onSubmit() {
    const updateArray = compareObjects(inputs, inputsRow);
    if (!updateArray.length) return showWarning(t('你似乎并没有修改什么'));
    const requestQueue = updateArray.map((item) => {
      let value = '';
      if (typeof inputs[item.key] === 'boolean') {
        value = String(inputs[item.key]);
      } else {
        value = inputs[item.key];
      }
      return API.put('/api/option/', {
        key: item.key,
        value,
      });
    });
    setLoading(true);
    Promise.all(requestQueue)
      .then((res) => {
        if (requestQueue.length === 1) {
          if (res.includes(undefined)) return;
        } else if (requestQueue.length > 1) {
          if (res.includes(undefined)) return showError(t('部分保存失败，请重试'));
        }
        showSuccess(t('保存成功'));
        props.refresh();
      })
      .catch(() => {
        showError(t('保存失败，请重试'));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    const currentInputs = {};
    for (let key in props.options) {
      if (Object.keys(inputs).includes(key)) {
        currentInputs[key] = props.options[key];
      }
    }
    setInputs(currentInputs);
    setInputsRow(structuredClone(currentInputs));
  }, [props.options]);

  return (
    <div className="space-y-8">
      {loading && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      
      <div className="space-y-6">
        <h3 className="text-lg font-medium">{t('模型请求速率限制')}</h3>
        
        <div className="grid gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="ModelRequestRateLimitEnabled"
              checked={inputs.ModelRequestRateLimitEnabled}
              onCheckedChange={(value) => {
                setInputs({
                  ...inputs,
                  ModelRequestRateLimitEnabled: value,
                });
              }}
            />
            <Label htmlFor="ModelRequestRateLimitEnabled">
              {t('启用用户模型请求速率限制（可能会影响高并发性能）')}
            </Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ModelRequestRateLimitDurationMinutes">{t('限制周期')}</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="ModelRequestRateLimitDurationMinutes"
                  type="number"
                  min={0}
                  value={inputs.ModelRequestRateLimitDurationMinutes}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      ModelRequestRateLimitDurationMinutes: String(e.target.value),
                    })
                  }
                  className="max-w-[150px]"
                />
                <span>{t('分钟')}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t('频率限制的周期（分钟）')}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ModelRequestRateLimitCount">{t('用户每周期最多请求次数')}</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="ModelRequestRateLimitCount"
                  type="number"
                  min={0}
                  value={inputs.ModelRequestRateLimitCount}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      ModelRequestRateLimitCount: String(e.target.value),
                    })
                  }
                  className="max-w-[150px]"
                />
                <span>{t('次')}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t('包括失败请求的次数，0代表不限制')}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ModelRequestRateLimitSuccessCount">{t('用户每周期最多请求完成次数')}</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="ModelRequestRateLimitSuccessCount"
                  type="number"
                  min={1}
                  value={inputs.ModelRequestRateLimitSuccessCount}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      ModelRequestRateLimitSuccessCount: String(e.target.value),
                    })
                  }
                  className="max-w-[150px]"
                />
                <span>{t('次')}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t('只包括请求成功的次数')}</p>
            </div>
          </div>
          
          <div>
            <Button onClick={onSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('保存中...')}
                </>
              ) : (
                t('保存模型速率限制')
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
