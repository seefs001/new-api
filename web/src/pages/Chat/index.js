import { Alert, AlertDescription } from "../../components/ui/alert";

import React from 'react';
import { useParams } from 'react-router-dom';
import { useTokenKeys } from '../../components/fetchTokenKeys';

const ChatPage = () => {
  const { id } = useParams();
  const { keys, serverAddress, isLoading } = useTokenKeys(id);

  const comLink = (key) => {
    // console.log('chatLink:', chatLink);
    if (!serverAddress || !key) return '';
      let link = "";
      if (id) {
          let chats = localStorage.getItem('chats');
          if (chats) {
              chats = JSON.parse(chats);
              if (Array.isArray(chats) && chats.length > 0) {
                  for (let k in chats[id]) {
                      link = chats[id][k];
                      link = link.replaceAll('{address}', encodeURIComponent(serverAddress));
                      link = link.replaceAll('{key}', 'sk-' + key);
                  }
              }
          }
      }
      return link;
  };

  const iframeSrc = keys.length > 0 ? comLink(keys[0]) : '';

  return !isLoading && iframeSrc ? (
    <iframe
      src={iframeSrc}
      className="w-full h-full border-none"
      title="Token Frame"
      allow="camera;microphone"
    />
  ) : (
    <div className="container mx-auto p-4">
      <Alert variant="warning">
        <AlertDescription>正在跳转......</AlertDescription>
      </Alert>
    </div>
  );
};

export default ChatPage;