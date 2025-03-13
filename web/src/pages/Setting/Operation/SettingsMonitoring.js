import {
  API,
  compareObjects,
  showError,
  showSuccess,
  showWarning,
} from '../../../helpers';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import React, { useEffect, useRef, useState } from 'react';

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Loader2 } from "lucide-react";
import { Switch } from "../../../components/ui/switch";
import { Textarea } from "../../../components/ui/textarea";
import { useTranslation } from 'react-i18next';

export default function SettingsMonitoring(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    AutomaticDisableChannelEnabled: false,
    AutomaticEnableChannelEnabled: false,
    ChannelDisableThreshold: '',
    AutomaticDisableKeywords: '',
  });
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
    <>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('监控设置')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ChannelDisableThreshold">{t('通道禁用阈值')}</Label>
                <Input
                  id="ChannelDisableThreshold"
                  type="number"
                  min={0}
                  step={0.01}
                  value={inputs.ChannelDisableThreshold}
                  onChange={(e) => 
                    setInputs({
                      ...inputs,
                      ChannelDisableThreshold: e.target.value,
                    })
                  }
                  placeholder={t('例如：0.30，表示当通道连续失败率超过 30% 时自动禁用')}
                  className="max-w-md"
                />
                <p className="text-xs text-muted-foreground">{t('例如：0.30，表示当通道连续失败率超过 30% 时自动禁用')}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="AutomaticDisableChannelEnabled"
                    checked={inputs.AutomaticDisableChannelEnabled}
                    onCheckedChange={(checked) => {
                      setInputs({
                        ...inputs,
                        AutomaticDisableChannelEnabled: checked,
                      });
                    }}
                  />
                  <Label htmlFor="AutomaticDisableChannelEnabled">{t('失败时自动禁用通道')}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="AutomaticEnableChannelEnabled"
                    checked={inputs.AutomaticEnableChannelEnabled}
                    onCheckedChange={(checked) => {
                      setInputs({
                        ...inputs,
                        AutomaticEnableChannelEnabled: checked,
                      });
                    }}
                  />
                  <Label htmlFor="AutomaticEnableChannelEnabled">{t('成功时自动启用通道')}</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="AutomaticDisableKeywords">{t('自动禁用关键词')}</Label>
                <Textarea
                  id="AutomaticDisableKeywords"
                  value={inputs.AutomaticDisableKeywords}
                  onChange={(e) => 
                    setInputs({
                      ...inputs,
                      AutomaticDisableKeywords: e.target.value,
                    })
                  }
                  placeholder={t('一行一个，不区分大小写')}
                  rows={6}
                  className="font-mono resize-y max-w-2xl"
                />
                <p className="text-xs text-muted-foreground">
                  {t('当上游通道返回错误中包含这些关键词时（不区分大小写），自动禁用通道')}
                </p>
              </div>
              
              <Button onClick={onSubmit} className="mt-4">
                {t('保存监控设置')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
