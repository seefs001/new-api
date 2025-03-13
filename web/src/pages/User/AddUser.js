import { API, showError, showSuccess } from '../../helpers';
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "../../components/ui/sheet";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Loader2 } from "lucide-react";

const AddUser = (props) => {
  const originInputs = {
    username: '',
    display_name: '',
    password: '',
  };
  const [inputs, setInputs] = useState(originInputs);
  const [loading, setLoading] = useState(false);
  const { username, display_name, password } = inputs;

  const handleInputChange = (name, value) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const submit = async () => {
    setLoading(true);
    if (inputs.username === '' || inputs.password === '') {
      setLoading(false);
      showError('用户名和密码不能为空！');
      return;
    }
    const res = await API.post(`/api/user/`, inputs);
    const { success, message } = res.data;
    if (success) {
      showSuccess('用户账户创建成功！');
      setInputs(originInputs);
      props.refresh();
      props.handleClose();
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    props.handleClose();
  };

  return (
    <Sheet open={props.visible} onOpenChange={handleCancel}>
      <SheetContent side="left" className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>添加用户</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          <div className={loading ? "opacity-50 pointer-events-none" : ""}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  className="mt-1"
                  placeholder="请输入用户名"
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  value={username}
                  autoComplete="off"
                />
              </div>
              
              <div>
                <Label htmlFor="display_name">显示名称</Label>
                <Input
                  id="display_name"
                  className="mt-1"
                  placeholder="请输入显示名称"
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  value={display_name}
                  autoComplete="off"
                />
              </div>
              
              <div>
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  className="mt-1"
                  type="password"
                  placeholder="请输入密码"
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  value={password}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        </div>
        
        <SheetFooter className="pt-4 border-t">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button onClick={submit} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              提交
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddUser;
