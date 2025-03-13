import {
  API,
  compareObjects,
  showError,
  showSuccess,
  showWarning,
} from '../../../helpers';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import React, { useEffect, useRef, useState } from 'react';

import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function GeneralSettings(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showQuotaWarning, setShowQuotaWarning] = useState(false);
  const [inputs, setInputs] = useState({
    TopUpLink: '',
    'general_setting.docs_link': '',
    QuotaPerUnit: '',
    RetryTimes: '',
    DisplayInCurrencyEnabled: false,
    DisplayTokenStatEnabled: false,
    DefaultCollapseSidebar: false,
    DemoSiteEnabled: false,
    SelfUseModeEnabled: false,
  });
  const formRef = useRef();
  const [inputsRow, setInputsRow] = useState(inputs);

  function onChange(name, value) {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  }

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
        showSuccess(t('保存成功'));
        setInputsRow(inputs);
      })
      .catch((err) => {
        showError(t('保存失败'));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const loadOptions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/option/');
      const { success, message, data } = res.data;
      if (success) {
        let newInputs = {};
        data.forEach((item) => {
          if (item.key === 'QuotaPerUnit') {
            if (item.value === '') {
              setShowQuotaWarning(true);
            }
          }
          if (
            item.key === 'DisplayInCurrencyEnabled' ||
            item.key === 'DisplayTokenStatEnabled' ||
            item.key === 'DefaultCollapseSidebar' ||
            item.key === 'DemoSiteEnabled' ||
            item.key === 'SelfUseModeEnabled'
          ) {
            newInputs[item.key] = item.value === 'true';
          } else {
            newInputs[item.key] = item.value;
          }
        });
        setInputs(newInputs);
        setInputsRow(newInputs);
      } else {
        showError(message);
      }
    } catch (error) {
      showError(t('获取设置项失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions().then();
  }, []);

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {showQuotaWarning && (
        <Alert variant="warning" className="mb-4">
          <AlertTitle>{t('警告')}</AlertTitle>
          <AlertDescription>
            {t('您尚未设置单位额度价格，这将导致充值功能无法正常使用！')}
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>{t('通用设置')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="TopUpLink">{t('充值链接')}</Label>
                <Input
                  id="TopUpLink"
                  value={inputs.TopUpLink}
                  onChange={(e) => onChange('TopUpLink', e.target.value)}
                  placeholder={t('请输入充值链接')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="general_setting.docs_link">{t('文档链接')}</Label>
                <Input
                  id="general_setting.docs_link"
                  value={inputs['general_setting.docs_link']}
                  onChange={(e) => onChange('general_setting.docs_link', e.target.value)}
                  placeholder={t('请输入文档链接')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="QuotaPerUnit">{t('单位额度价格')}</Label>
                <Input
                  id="QuotaPerUnit"
                  value={inputs.QuotaPerUnit}
                  onChange={(e) => onChange('QuotaPerUnit', e.target.value)}
                  placeholder={t('请输入单位额度价格')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="RetryTimes">{t('重试次数')}</Label>
                <Input
                  id="RetryTimes"
                  value={inputs.RetryTimes}
                  onChange={(e) => onChange('RetryTimes', e.target.value)}
                  placeholder={t('请输入重试次数')}
                />
              </div>
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="DisplayInCurrencyEnabled"
                  checked={inputs.DisplayInCurrencyEnabled}
                  onCheckedChange={(checked) => onChange('DisplayInCurrencyEnabled', checked)}
                />
                <Label htmlFor="DisplayInCurrencyEnabled">{t('以货币形式显示额度')}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="DisplayTokenStatEnabled"
                  checked={inputs.DisplayTokenStatEnabled}
                  onCheckedChange={(checked) => onChange('DisplayTokenStatEnabled', checked)}
                />
                <Label htmlFor="DisplayTokenStatEnabled">{t('显示 Token 统计')}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="DefaultCollapseSidebar"
                  checked={inputs.DefaultCollapseSidebar}
                  onCheckedChange={(checked) => onChange('DefaultCollapseSidebar', checked)}
                />
                <Label htmlFor="DefaultCollapseSidebar">{t('默认折叠侧边栏')}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="DemoSiteEnabled"
                  checked={inputs.DemoSiteEnabled}
                  onCheckedChange={(checked) => onChange('DemoSiteEnabled', checked)}
                />
                <Label htmlFor="DemoSiteEnabled">{t('演示站点模式')}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="SelfUseModeEnabled"
                  checked={inputs.SelfUseModeEnabled}
                  onCheckedChange={(checked) => onChange('SelfUseModeEnabled', checked)}
                />
                <Label htmlFor="SelfUseModeEnabled">{t('自用模式')}</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('保存')}
        </Button>
      </div>
      
      <Dialog open={showQuotaWarning} onOpenChange={setShowQuotaWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('警告')}</DialogTitle>
            <DialogDescription>
              {t('您尚未设置单位额度价格，这将导致充值功能无法正常使用！')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowQuotaWarning(false)}>
              {t('我知道了')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
