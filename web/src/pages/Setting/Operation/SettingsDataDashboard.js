import {
  API,
  compareObjects,
  showError,
  showSuccess,
  showWarning,
} from '../../../helpers';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import React, { useEffect, useRef, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Loader2 } from "lucide-react";
import { Switch } from "../../../components/ui/switch";
import { useTranslation } from 'react-i18next';

export default function SettingsDataDashboard(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    DataExportEnabled: false,
    DataExportInterval: 5,
    DataExportDefaultTime: 'hour',
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
            <CardTitle>{t('数据看板设置')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="DataExportEnabled"
                  checked={inputs.DataExportEnabled}
                  onCheckedChange={(checked) => {
                    setInputs({
                      ...inputs,
                      DataExportEnabled: checked,
                    });
                  }}
                />
                <Label htmlFor="DataExportEnabled">{t('启用数据导出功能')}</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="DataExportInterval">{t('导出时间间隔')}</Label>
                  <Input
                    id="DataExportInterval"
                    type="number"
                    min={1}
                    value={inputs.DataExportInterval}
                    onChange={(e) => 
                      setInputs({
                        ...inputs,
                        DataExportInterval: e.target.value,
                      })
                    }
                    className="max-w-xs"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="DataExportDefaultTime">{t('默认时间单位')}</Label>
                  <Select
                    value={inputs.DataExportDefaultTime}
                    onValueChange={(value) => 
                      setInputs({
                        ...inputs,
                        DataExportDefaultTime: value,
                      })
                    }
                  >
                    <SelectTrigger className="max-w-xs">
                      <SelectValue placeholder={t('选择时间单位')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">{t('小时')}</SelectItem>
                      <SelectItem value="day">{t('天')}</SelectItem>
                      <SelectItem value="week">{t('周')}</SelectItem>
                      <SelectItem value="month">{t('月')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={onSubmit} className="mt-4">
                {t('保存数据看板设置')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
