import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

import React from 'react';

const NotFound = () => (
  <div className="container mx-auto py-12 px-4">
    <Alert variant="destructive">
      <AlertTitle>页面不存在</AlertTitle>
      <AlertDescription>请检查你的浏览器地址是否正确</AlertDescription>
    </Alert>
  </div>
);

export default NotFound;
