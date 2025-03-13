import {
  API,
  compareObjects,
  showError,
  showSuccess,
  showWarning,
} from '../../../helpers';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import React, { useEffect, useRef, useState } from 'react';

import { Button } from "../../../components/ui/button";
import { Calendar } from "../../../components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Label } from "../../../components/ui/label";
import { Loader2 } from "lucide-react";
import { Switch } from "../../../components/ui/switch";
import { cn } from "../../../lib/utils";
import dayjs from 'dayjs';
import { format } from "date-fns";
import { useTranslation } from 'react-i18next';

export default function SettingsLog(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [loadingCleanHistoryLog, setLoadingCleanHistoryLog] = useState(false);
  const [inputs, setInputs] = useState({
    LogConsumeEnabled: false,
    historyTimestamp: dayjs().subtract(1, 'month').toDate(),
  });
  const [inputsRow, setInputsRow] = useState(inputs);

  function onSubmit() {
    const updateArray = compareObjects(inputs, inputsRow).filter(
      (item) => item.key !== 'historyTimestamp',
    );

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

  async function onCleanHistoryLog() {
    try {
      setLoadingCleanHistoryLog(true);
      const res = await API.post('/api/log/clean', {
        timestamp: inputs.historyTimestamp.getTime() / 1000,
      });
      const { success, message, data } = res.data;
      if (success) {
        showSuccess(t('清除成功，一共清除了 {{count}} 条记录', { count: data }));
      } else {
        showError(message);
      }
    } catch (error) {
      showError(t('清除历史记录失败，{{error}}', { error: error.message }));
    } finally {
      setLoadingCleanHistoryLog(false);
    }
  }

  useEffect(() => {
    const currentInputs = {};
    for (let key in props.options) {
      if (Object.keys(inputs).includes(key)) {
        currentInputs[key] = props.options[key];
      }
    }
    setInputs((prev) => ({
      ...prev,
      ...currentInputs,
    }));
    setInputsRow((prev) => ({
      ...prev,
      ...currentInputs,
    }));
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
            <CardTitle>{t('日志设置')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="LogConsumeEnabled"
                  checked={inputs.LogConsumeEnabled}
                  onCheckedChange={(checked) => {
                    setInputs({
                      ...inputs,
                      LogConsumeEnabled: checked,
                    });
                  }}
                />
                <Label htmlFor="LogConsumeEnabled">{t('启用额度消费日志记录')}</Label>
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="historyTimestamp">{t('日志记录时间')}</Label>
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="historyTimestamp"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal sm:w-[240px]",
                          !inputs.historyTimestamp && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {inputs.historyTimestamp ? (
                          format(inputs.historyTimestamp, "PPP HH:mm:ss")
                        ) : (
                          <span>{t('选择日期')}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={inputs.historyTimestamp}
                        onSelect={(date) => 
                          setInputs({
                            ...inputs,
                            historyTimestamp: date,
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Button 
                    onClick={onCleanHistoryLog}
                    disabled={loadingCleanHistoryLog}
                  >
                    {loadingCleanHistoryLog && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('清除历史日志')}
                  </Button>
                </div>
              </div>
              
              <Button onClick={onSubmit} className="mt-4">
                {t('保存日志设置')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
