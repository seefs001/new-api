import { Loader2 } from "lucide-react";
import React from 'react';
import { useTokenKeys } from '../../components/fetchTokenKeys';

const chat2page = () => {
  const { keys, chatLink, serverAddress, isLoading } = useTokenKeys();

  const comLink = (key) => {
    if (!chatLink || !serverAddress || !key) return '';
    return `${chatLink}/#/?settings={"key":"sk-${key}","url":"${encodeURIComponent(serverAddress)}"}`;
  };

  if (keys.length > 0) {
    const redirectLink = comLink(keys[0]);
    if (redirectLink) {
      window.location.href = redirectLink;
    }
  }

  return (
    <div className="container mx-auto py-12 flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <h3 className="text-xl font-medium">正在加载，请稍候...</h3>
    </div>
  );
};

export default chat2page;