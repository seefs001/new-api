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
import { Label } from "../../../components/ui/label";
import { Loader2 } from "lucide-react";
import { Switch } from "../../../components/ui/switch";
import { useTranslation } from 'react-i18next';

export default function SettingsDrawing(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    DrawingEnabled: false,
    MjNotifyEnabled: false,
    MjAccountFilterEnabled: false,
    MjForwardUrlEnabled: false,
    MjModeClearEnabled: false,
    MjActionCheckSuccessEnabled: false,
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
            <CardTitle>{t('绘图设置')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="DrawingEnabled"
                    checked={inputs.DrawingEnabled}
                    onCheckedChange={(checked) => {
                      setInputs({
                        ...inputs,
                        DrawingEnabled: checked,
                      });
                    }}
                  />
                  <Label htmlFor="DrawingEnabled">{t('启用绘图功能')}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="MjNotifyEnabled"
                    checked={inputs.MjNotifyEnabled}
                    onCheckedChange={(checked) => {
                      setInputs({
                        ...inputs,
                        MjNotifyEnabled: checked,
                      });
                    }}
                  />
                  <Label htmlFor="MjNotifyEnabled">{t('启用 MidJourney 通知')}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="MjAccountFilterEnabled"
                    checked={inputs.MjAccountFilterEnabled}
                    onCheckedChange={(checked) => {
                      setInputs({
                        ...inputs,
                        MjAccountFilterEnabled: checked,
                      });
                    }}
                  />
                  <Label htmlFor="MjAccountFilterEnabled">{t('启用 MidJourney 账号过滤')}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="MjForwardUrlEnabled"
                    checked={inputs.MjForwardUrlEnabled}
                    onCheckedChange={(checked) => {
                      setInputs({
                        ...inputs,
                        MjForwardUrlEnabled: checked,
                      });
                    }}
                  />
                  <Label htmlFor="MjForwardUrlEnabled">{t('启用 MidJourney 转发')}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="MjModeClearEnabled"
                    checked={inputs.MjModeClearEnabled}
                    onCheckedChange={(checked) => {
                      setInputs({
                        ...inputs,
                        MjModeClearEnabled: checked,
                      });
                    }}
                  />
                  <Label htmlFor="MjModeClearEnabled">{t('启用 MidJourney 模式清除')}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="MjActionCheckSuccessEnabled"
                    checked={inputs.MjActionCheckSuccessEnabled}
                    onCheckedChange={(checked) => {
                      setInputs({
                        ...inputs,
                        MjActionCheckSuccessEnabled: checked,
                      });
                    }}
                  />
                  <Label htmlFor="MjActionCheckSuccessEnabled">{t('启用 MidJourney 动作成功检查')}</Label>
                </div>
              </div>
              
              <Button onClick={onSubmit} className="mt-4">
                {t('保存绘图设置')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
