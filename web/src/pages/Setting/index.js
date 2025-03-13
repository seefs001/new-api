import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useLocation, useNavigate } from 'react-router-dom';

import ModelSetting from '../../components/ModelSetting.js';
import OperationSetting from '../../components/OperationSetting';
import OtherSetting from '../../components/OtherSetting';
import PersonalSetting from '../../components/PersonalSetting';
import RateLimitSetting from '../../components/RateLimitSetting.js';
import SystemSetting from '../../components/SystemSetting';
import { isRoot } from '../../helpers';
import { useTranslation } from 'react-i18next';

const Setting = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [tabActiveKey, setTabActiveKey] = useState('operation');
  let panes = [];

  if (isRoot()) {
    panes.push({
      tab: t('运营设置'),
      content: <OperationSetting />,
      itemKey: 'operation',
    });
    panes.push({
      tab: t('速率限制设置'),
      content: <RateLimitSetting />,
      itemKey: 'ratelimit',
    });
    panes.push({
      tab: t('模型相关设置'),
      content: <ModelSetting />,
      itemKey: 'models',
    });
    panes.push({
      tab: t('系统设置'),
      content: <SystemSetting />,
      itemKey: 'system',
    });
    panes.push({
      tab: t('其他设置'),
      content: <OtherSetting />,
      itemKey: 'other',
    });
  }

  const onChangeTab = (key) => {
    setTabActiveKey(key);
    navigate(`?tab=${key}`);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      setTabActiveKey(tab);
    } else {
      onChangeTab('operation');
    }
  }, [location.search]);

  return (
    <div className="container mx-auto py-6">
      <Tabs value={tabActiveKey} onValueChange={onChangeTab} className="w-full">
        <TabsList className="mb-4">
          {panes.map((pane) => (
            <TabsTrigger key={pane.itemKey} value={pane.itemKey}>
              {pane.tab}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {panes.map((pane) => (
          <TabsContent key={pane.itemKey} value={pane.itemKey}>
            {pane.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Setting;
