import ChannelsTable from '../../components/ChannelsTable';
import React from 'react';
import { useTranslation } from 'react-i18next';

const File = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-4 border-b">
        <h3 className="text-xl font-semibold">{t('管理渠道')}</h3>
      </div>
      <div className="flex-grow p-4">
        <ChannelsTable />
      </div>
    </div>
  );
};

export default File;
