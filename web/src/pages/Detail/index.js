import {
  API,
  isAdmin,
  showError,
  timestamp2string,
  timestamp2string1,
} from '../../helpers';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../../components/ui/form";
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  getQuotaWithUnit,
  modelColorMap,
  modelToColor,
  renderNumber,
  renderQuota,
  renderQuotaNumberWithDigit,
  stringToColor,
} from '../../helpers/render';

// Import Shadcn UI components
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Loader2 } from "lucide-react";
import { StyleContext } from '../../context/Style/index.js';
import { UserContext } from '../../context/User/index.js';
import { VChart } from "@visactor/react-vchart";
import { initVChartSemiTheme } from '@visactor/vchart-semi-theme';
import { useTranslation } from 'react-i18next';

const Detail = (props) => {
  const { t } = useTranslation();
  const formRef = useRef();
  let now = new Date();
  const [userState, userDispatch] = useContext(UserContext);
  const [styleState, styleDispatch] = useContext(StyleContext);
  const [inputs, setInputs] = useState({
    username: '',
    token_name: '',
    model_name: '',
    start_timestamp:
      localStorage.getItem('data_export_default_time') === 'hour'
        ? timestamp2string(now.getTime() / 1000 - 86400)
        : localStorage.getItem('data_export_default_time') === 'week'
          ? timestamp2string(now.getTime() / 1000 - 86400 * 30)
          : timestamp2string(now.getTime() / 1000 - 86400 * 7),
    end_timestamp: timestamp2string(now.getTime() / 1000 + 3600),
    channel: '',
    data_export_default_time: '',
  });
  const { username, model_name, start_timestamp, end_timestamp, channel } =
    inputs;
  const isAdminUser = isAdmin();
  const initialized = useRef(false);
  const [loading, setLoading] = useState(false);
  const [quotaData, setQuotaData] = useState([]);
  const [consumeQuota, setConsumeQuota] = useState(0);
  const [consumeTokens, setConsumeTokens] = useState(0);
  const [times, setTimes] = useState(0);
  const [dataExportDefaultTime, setDataExportDefaultTime] = useState(
    localStorage.getItem('data_export_default_time') || 'hour',
  );
  const [pieData, setPieData] = useState([{ type: 'null', value: '0' }]);
  const [lineData, setLineData] = useState([]);
  const [spec_pie, setSpecPie] = useState({
    type: 'pie',
    data: [{
      id: 'id0',
      values: [{ type: 'null', value: '0' }]
    }],
    title: {
      visible: true,
      text: t('模型调用次数占比'),
      subtext: `${t('总计')}：${renderNumber(0)}`,
    },
  });
  const [spec_line, setSpecLine] = useState({
    type: 'bar',
    data: [{
      id: 'barData',
      values: []
    }],
    title: {
      visible: true,
      text: t('模型消耗分布'),
      subtext: `${t('总计')}：${renderQuota(0, 2)}`,
    },
  });
  
  // Add modelColors state
  const [modelColors, setModelColors] = useState({});

  const handleInputChange = (value, name) => {
    if (name === 'data_export_default_time') {
      setDataExportDefaultTime(value);
      return;
    }
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const loadQuotaData = async () => {
    setLoading(true);
    try {
      let url = '';
      let localStartTimestamp = Date.parse(start_timestamp) / 1000;
      let localEndTimestamp = Date.parse(end_timestamp) / 1000;
      if (isAdminUser) {
        url = `/api/data/?username=${username}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}&default_time=${dataExportDefaultTime}`;
      } else {
        url = `/api/data/self/?start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}&default_time=${dataExportDefaultTime}`;
      }
      const res = await API.get(url);
      const { success, message, data } = res.data;
      if (success) {
        setQuotaData(data);
        if (data.length === 0) {
          data.push({
            count: 0,
            model_name: '无数据',
            quota: 0,
            created_at: now.getTime() / 1000,
          });
        }
        // sort created_at
        data.sort((a, b) => a.created_at - b.created_at);
        updateChartData(data);
      } else {
        showError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await loadQuotaData();
  };

  const initChart = async () => {
    await loadQuotaData();
  };

  const updateChartData = (data) => {
    // Implementation of updateChartData function
    // This would normally contain logic to process data for charts
  };

  const getUserData = async () => {
    let res = await API.get(`/api/user/self`);
    const {success, message, data} = res.data;
    if (success) {
      userDispatch({type: 'login', payload: data});
    } else {
      showError(message);
    }
  };

  useEffect(() => {
    getUserData()
    if (!initialized.current) {
      initVChartSemiTheme({
        isWatchingThemeSwitch: true,
      });
      initialized.current = true;
      initChart();
    }
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-2xl font-semibold">{t('数据看板')}</h3>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <FormLabel>{t('起始时间')}</FormLabel>
              <Input
                type="datetime-local"
                value={start_timestamp}
                onChange={(e) => handleInputChange(e.target.value, 'start_timestamp')}
                className="mt-1"
              />
            </div>
            
            <div>
              <FormLabel>{t('结束时间')}</FormLabel>
              <Input
                type="datetime-local"
                value={end_timestamp}
                onChange={(e) => handleInputChange(e.target.value, 'end_timestamp')}
                className="mt-1"
              />
            </div>
            
            <div>
              <FormLabel>{t('时间粒度')}</FormLabel>
              <Select
                value={dataExportDefaultTime}
                onValueChange={(value) => handleInputChange(value, 'data_export_default_time')}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('时间粒度')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">{t('小时')}</SelectItem>
                  <SelectItem value="day">{t('天')}</SelectItem>
                  <SelectItem value="week">{t('周')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isAdminUser && (
            <div>
              <FormLabel>{t('用户名称')}</FormLabel>
              <Input
                placeholder={t('可选值')}
                value={username}
                onChange={(e) => handleInputChange(e.target.value, 'username')}
                className="w-full md:max-w-xs mt-1"
              />
            </div>
          )}
          
          <Button onClick={refresh} disabled={loading} className="mt-2">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t('查询')}
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{t('当前余额')}</span>
                    <span>{renderQuota(userState?.user?.quota)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{t('历史消耗')}</span>
                    <span>{renderQuota(userState?.user?.used_quota)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{t('请求次数')}</span>
                    <span>{userState.user?.request_count}</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{t('统计额度')}</span>
                    <span>{renderQuota(consumeQuota)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{t('统计Tokens')}</span>
                    <span>{consumeTokens}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{t('统计次数')}</span>
                    <span>{times}</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{t('平均RPM')}</span>
                    <span>
                      {(times /
                        ((Date.parse(end_timestamp) -
                          Date.parse(start_timestamp)) /
                          60000)).toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{t('平均TPM')}</span>
                    <span>
                      {(consumeTokens /
                        ((Date.parse(end_timestamp) -
                          Date.parse(start_timestamp)) /
                          60000)).toFixed(3)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
            
            <Card className="p-4">
              <Tabs defaultValue="1">
                <TabsList className="mb-4">
                  <TabsTrigger value="1">{t('消耗分布')}</TabsTrigger>
                  <TabsTrigger value="2">{t('调用次数分布')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="1">
                  <div className="h-[500px]">
                    <VChart
                      spec={spec_line}
                      option={{ mode: "desktop-browser" }}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="2">
                  <div className="h-[500px]">
                    <VChart
                      spec={spec_pie}
                      option={{ mode: "desktop-browser" }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Detail;
