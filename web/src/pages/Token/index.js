import { Alert, AlertDescription } from "../../components/ui/alert";

import React from 'react';
import TokensTable from '../../components/TokensTable';
import { useTranslation } from 'react-i18next';

const Token = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Alert variant="warning">
        <AlertDescription>
          {t('令牌无法精确控制使用额度，只允许自用，请勿直接将令牌分发给他人。')}
        </AlertDescription>
      </Alert>
      
      <div>
        <TokensTable />
      </div>
    </div>
  );
};

export default Token;
