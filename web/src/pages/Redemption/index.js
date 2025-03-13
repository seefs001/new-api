import React from 'react';
import RedemptionsTable from '../../components/RedemptionsTable';
import { useTranslation } from 'react-i18next';

const Redemption = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-2xl font-semibold">{t('管理兑换码')}</h3>
      </div>
      <div>
        <RedemptionsTable />
      </div>
    </div>
  );
}

export default Redemption;
