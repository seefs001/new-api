import React from 'react';

const Loading = ({ prompt: name = 'page' }) => {
  return (
    <div className="flex items-center justify-center h-[100px] w-full">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="text-sm text-muted-foreground">加载{name}中...</span>
      </div>
    </div>
  );
};

export default Loading;
