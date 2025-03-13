import { API, isMobile, showError, showInfo, showSuccess } from '../../helpers';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import React, { useEffect, useState } from 'react';
import {
  renderNumber,
  renderQuota,
  renderQuotaWithAmount,
} from '../../helpers/render';

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Link } from 'react-router-dom';
import { Separator } from "../../components/ui/separator";
import { toast } from "../../components/ui/use-toast";
import { useTranslation } from 'react-i18next';

const TopUp = () => {
  const { t } = useTranslation();
  const [redemptionCode, setRedemptionCode] = useState('');
  const [topUpCode, setTopUpCode] = useState('');
  const [topUpCount, setTopUpCount] = useState(0);
  const [minTopupCount, setMinTopUpCount] = useState(1);
  const [amount, setAmount] = useState(0.0);
  const [minTopUp, setMinTopUp] = useState(1);
  const [topUpLink, setTopUpLink] = useState('');
  const [enableOnlineTopUp, setEnableOnlineTopUp] = useState(false);
  const [userQuota, setUserQuota] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [payWay, setPayWay] = useState('');

  const topUp = async () => {
    if (redemptionCode === '') {
      showInfo(t('请输入兑换码！'));
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await API.post('/api/user/topup', {
        key: redemptionCode,
      });
      const { success, message, data } = res.data;
      if (success) {
        showSuccess(t('兑换成功！'));
        toast({
          title: t('兑换成功！'),
          description: t('成功兑换额度：') + renderQuota(data),
        });
        setUserQuota((quota) => {
          return quota + data;
        });
        setRedemptionCode('');
      } else {
        showError(message);
      }
    } catch (err) {
      showError(t('请求失败'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTopUpLink = () => {
    if (!topUpLink) {
      showError(t('超级管理员未设置充值链接！'));
      return;
    }
    window.open(topUpLink, '_blank');
  };

  const preTopUp = async (payment) => {
    if (!enableOnlineTopUp) {
      showError(t('管理员未开启在线充值！'));
      return;
    }
    await getAmount();
    if (topUpCount < minTopUp) {
      showError(t('充值数量不能小于') + minTopUp);
      return;
    }
    setPayWay(payment);
    setOpen(true);
  };

  const onlineTopUp = async () => {
    if (amount === 0) {
      await getAmount();
    }
    if (topUpCount < minTopUp) {
      showError('充值数量不能小于' + minTopUp);
      return;
    }
    setOpen(false);
    try {
      const res = await API.post('/api/user/pay', {
        amount: parseInt(topUpCount),
        top_up_code: topUpCode,
        payment_method: payWay,
      });
      if (res !== undefined) {
        const { message, data } = res.data;
        // showInfo(message);
        if (message === 'success') {
          let params = data;
          let url = res.data.url;
          let form = document.createElement('form');
          form.action = url;
          form.method = 'POST';
          // 判断是否为safari浏览器
          let isSafari =
            navigator.userAgent.indexOf('Safari') > -1 &&
            navigator.userAgent.indexOf('Chrome') < 1;
          if (!isSafari) {
            form.target = '_blank';
          }
          for (let key in params) {
            let input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = params[key];
            form.appendChild(input);
          }
          document.body.appendChild(form);
          form.submit();
          document.body.removeChild(form);
        } else {
          showError(data);
          // setTopUpCount(parseInt(res.data.count));
          // setAmount(parseInt(data));
        }
      } else {
        showError(res);
      }
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  const getUserQuota = async () => {
    let res = await API.get(`/api/user/self`);
    const { success, message, data } = res.data;
    if (success) {
      setUserQuota(data.quota);
    } else {
      showError(message);
    }
  };

  useEffect(() => {
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      if (status.top_up_link) {
        setTopUpLink(status.top_up_link);
      }
      if (status.min_topup) {
        setMinTopUp(status.min_topup);
      }
      if (status.enable_online_topup) {
        setEnableOnlineTopUp(status.enable_online_topup);
      }
    }
    getUserQuota().then();
  }, []);

  const renderAmount = () => {
    // console.log(amount);
    return amount + ' ' + t('元');
  };

  const getAmount = async (value) => {
    if (value === undefined) {
      value = topUpCount;
    }
    try {
      const res = await API.post('/api/user/amount', {
        amount: parseFloat(value),
        top_up_code: topUpCode,
      });
      if (res !== undefined) {
        const { message, data } = res.data;
        // showInfo(message);
        if (message === 'success') {
          setAmount(parseFloat(data));
        } else {
          setAmount(0);
          toast({
            title: '错误',
            description: data,
            variant: 'destructive',
          });
          // setTopUpCount(parseInt(res.data.count));
          // setAmount(parseInt(data));
        }
      } else {
        showError(res);
      }
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-2xl font-semibold">{t('我的钱包')}</h3>
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('确定要充值吗')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('充值数量')}：{topUpCount}</p>
            <p>{t('实付金额')}：{renderAmount()}</p>
            <p>{t('是否确认充值？')}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {t('取消')}
            </Button>
            <Button onClick={onlineTopUp}>
              {t('确认')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-center">
              {t('余额')} {renderQuota(userQuota)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Separator className="my-4">
                <span className="px-2">{t('兑换余额')}</span>
              </Separator>
              <div className="space-y-4">
                <div>
                  <FormLabel>{t('兑换码')}</FormLabel>
                  <Input
                    placeholder={t('兑换码')}
                    value={redemptionCode}
                    onChange={(e) => setRedemptionCode(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {topUpLink && (
                    <Button
                      variant="default"
                      onClick={openTopUpLink}
                    >
                      {t('获取兑换码')}
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={topUp}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('兑换中...') : t('兑换')}
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <Separator className="my-4">
                <span className="px-2">{t('在线充值')}</span>
              </Separator>
              <div className="space-y-4">
                <div>
                  <FormLabel>{t('实付金额')}：{renderAmount()}</FormLabel>
                  <Input
                    disabled={!enableOnlineTopUp}
                    placeholder={t('充值数量，最低 ') + renderQuotaWithAmount(minTopUp)}
                    type="number"
                    value={topUpCount}
                    className="mt-1"
                    onChange={async (e) => {
                      let value = parseInt(e.target.value);
                      if (value < 1) {
                        value = 1;
                      }
                      setTopUpCount(value);
                      await getAmount(value);
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    onClick={() => preTopUp('zfb')}
                  >
                    {t('支付宝')}
                  </Button>
                  <Button
                    onClick={() => preTopUp('wx')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {t('微信')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TopUp;
