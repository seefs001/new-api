import {
  API,
  compareObjects,
  showError,
  showSuccess,
  showWarning
} from '../../../helpers';
import React, { useEffect, useState } from 'react';

import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Loader2 } from "lucide-react";
import { Switch } from "../../../components/ui/switch";
import { useTranslation } from 'react-i18next';

export default function SettingGlobalModel(props) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    'global.pass_through_request_enabled': false,
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
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">{t('全局设置')}</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="global-pass-through"
                checked={inputs['global.pass_through_request_enabled']}
                onCheckedChange={(checked) => 
                  setInputs({ ...inputs, 'global.pass_through_request_enabled': checked })
                }
              />
              <Label htmlFor="global-pass-through">
                {t('启用请求透传')}
              </Label>
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              开启后，所有请求将直接透传给上游，不会进行任何处理（重定向和渠道适配也将失效）,请谨慎开启
            </p>
          </div>

          <Button onClick={onSubmit} className="mt-4">
            {t('保存')}
          </Button>
        </div>
      )}
    </>
  );
}
