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
import { useTranslation } from 'react-i18next';

export default function SettingsCreditLimit(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    QuotaForNewUser: '',
    PreConsumedQuota: '',
    QuotaForInviter: '',
    QuotaForInvitee: '',
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
            <CardTitle>{t('额度设置')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="QuotaForNewUser">{t('新用户初始额度')}</Label>
                  <div className="relative">
                    <Input
                      id="QuotaForNewUser"
                      type="number"
                      min={0}
                      step={1}
                      value={inputs.QuotaForNewUser}
                      onChange={(e) => 
                        setInputs({
                          ...inputs,
                          QuotaForNewUser: e.target.value,
                        })
                      }
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-sm text-muted-foreground">Token</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="PreConsumedQuota">{t('请求预扣费额度')}</Label>
                  <div className="relative">
                    <Input
                      id="PreConsumedQuota"
                      type="number"
                      min={0}
                      step={1}
                      value={inputs.PreConsumedQuota}
                      onChange={(e) => 
                        setInputs({
                          ...inputs,
                          PreConsumedQuota: e.target.value,
                        })
                      }
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-sm text-muted-foreground">Token</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('请求结束后多退少补')}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="QuotaForInviter">{t('邀请新用户奖励额度')}</Label>
                  <div className="relative">
                    <Input
                      id="QuotaForInviter"
                      type="number"
                      min={0}
                      step={1}
                      value={inputs.QuotaForInviter}
                      placeholder={t('例如：2000')}
                      onChange={(e) => 
                        setInputs({
                          ...inputs,
                          QuotaForInviter: e.target.value,
                        })
                      }
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-sm text-muted-foreground">Token</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="QuotaForInvitee">{t('新用户使用邀请码奖励额度')}</Label>
                  <div className="relative">
                    <Input
                      id="QuotaForInvitee"
                      type="number"
                      min={0}
                      step={1}
                      value={inputs.QuotaForInvitee}
                      placeholder={t('例如：1000')}
                      onChange={(e) => 
                        setInputs({
                          ...inputs,
                          QuotaForInvitee: e.target.value,
                        })
                      }
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-sm text-muted-foreground">Token</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button onClick={onSubmit} className="mt-4">
                {t('保存额度设置')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
