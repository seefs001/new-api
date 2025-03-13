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
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import { Loader2 } from "lucide-react";
import { Textarea } from "../../../components/ui/textarea";
import { useTranslation } from 'react-i18next';

export default function SettingsSensitiveWords(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    CheckSensitiveEnabled: false,
    CheckSensitiveOnPromptEnabled: false,
    SensitiveWords: '',
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
            <CardTitle>{t('屏蔽词过滤设置')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="CheckSensitiveEnabled"
                    checked={inputs.CheckSensitiveEnabled}
                    onCheckedChange={(checked) => {
                      setInputs({
                        ...inputs,
                        CheckSensitiveEnabled: checked,
                      });
                    }}
                  />
                  <Label htmlFor="CheckSensitiveEnabled">
                    {t('启用屏蔽词过滤功能')}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="CheckSensitiveOnPromptEnabled"
                    checked={inputs.CheckSensitiveOnPromptEnabled}
                    onCheckedChange={(checked) => {
                      setInputs({
                        ...inputs,
                        CheckSensitiveOnPromptEnabled: checked,
                      });
                    }}
                  />
                  <Label htmlFor="CheckSensitiveOnPromptEnabled">
                    {t('启用 Prompt 检查')}
                  </Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="SensitiveWords">{t('屏蔽词列表')}</Label>
                <Textarea
                  id="SensitiveWords"
                  value={inputs.SensitiveWords}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      SensitiveWords: e.target.value,
                    })
                  }
                  placeholder={t('一行一个屏蔽词，不需要符号分割')}
                  rows={6}
                  className="font-mono resize-y"
                />
                <p className="text-sm text-muted-foreground">
                  {t('一行一个屏蔽词，不需要符号分割')}
                </p>
              </div>
              
              <Button onClick={onSubmit}>
                {t('保存屏蔽词过滤设置')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
