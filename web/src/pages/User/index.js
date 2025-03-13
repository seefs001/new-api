import React from 'react';
import UsersTable from '../../components/UsersTable';
import { useTranslation } from 'react-i18next';

const User = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-2xl font-semibold">{t('管理用户')}</h3>
      </div>
      <div>
        <UsersTable />
      </div>
    </div>
  );
};

export default User;
