import { API, isMobile, showError, showSuccess } from '../../helpers';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../../components/ui/dialog";
import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "../../components/ui/sheet";
import { renderQuota, renderQuotaWithPrompt } from '../../helpers/render';

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Loader2 } from "lucide-react";
import { Separator } from "../../components/ui/separator";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EditUser = (props) => {
  const userId = props.editingUser.id;
  const [loading, setLoading] = useState(true);
  const [addQuotaModalOpen, setAddQuotaModalOpen] = useState(false);
  const [addQuotaLocal, setAddQuotaLocal] = useState('');
  const [inputs, setInputs] = useState({
    username: '',
    display_name: '',
    password: '',
    github_id: '',
    oidc_id: '',
    wechat_id: '',
    email: '',
    quota: 0,
    group: 'default',
  });
  const [groupOptions, setGroupOptions] = useState([]);
  const {
    username,
    display_name,
    password,
    github_id,
    oidc_id,
    wechat_id,
    telegram_id,
    email,
    quota,
    group,
  } = inputs;
  const handleInputChange = (name, value) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };
  const fetchGroups = async () => {
    try {
      let res = await API.get(`/api/group/`);
      setGroupOptions(
        res.data.data.map((group) => ({
          label: group,
          value: group,
        })),
      );
    } catch (error) {
      showError(error.message);
    }
  };
  const navigate = useNavigate();
  const handleCancel = () => {
    props.handleClose();
  };
  const loadUser = async () => {
    setLoading(true);
    let res = undefined;
    if (userId) {
      res = await API.get(`/api/user/${userId}`);
    } else {
      res = await API.get(`/api/user/self`);
    }
    const { success, message, data } = res.data;
    if (success) {
      data.password = '';
      setInputs(data);
    } else {
      showError(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser().then();
    if (userId) {
      fetchGroups().then();
    }
  }, [props.editingUser.id]);

  const submit = async () => {
    setLoading(true);
    let res = undefined;
    if (userId) {
      let data = { ...inputs, id: parseInt(userId) };
      if (typeof data.quota === 'string') {
        data.quota = parseInt(data.quota);
      }
      res = await API.put(`/api/user/`, data);
    } else {
      res = await API.put(`/api/user/self`, inputs);
    }
    const { success, message } = res.data;
    if (success) {
      showSuccess('用户信息更新成功！');
      props.refresh();
      props.handleClose();
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const addLocalQuota = () => {
    let newQuota = parseInt(quota) + parseInt(addQuotaLocal);
    setInputs((inputs) => ({ ...inputs, quota: newQuota }));
  };

  const openAddQuotaModal = () => {
    setAddQuotaLocal('0');
    setAddQuotaModalOpen(true);
  };

  const { t } = useTranslation();

  return (
    <>
      <Sheet
        open={props.visible}
        onOpenChange={props.handleClose}
      >
        <SheetContent className="sm:max-w-md md:max-w-lg">
          <SheetHeader>
            <SheetTitle>{t('编辑用户')}</SheetTitle>
          </SheetHeader>
          
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('用户名')}</Label>
                <Input
                  id="username"
                  placeholder={t('请输入新的用户名')}
                  value={username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('密码')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('请输入新的密码，最短 8 位')}
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="display_name">{t('显示名称')}</Label>
                <Input
                  id="display_name"
                  placeholder={t('请输入新的显示名称')}
                  value={display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              
              {userId && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="group">{t('分组')}</Label>
                    <Select
                      value={inputs.group}
                      onValueChange={(value) => handleInputChange('group', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('请选择分组')} />
                      </SelectTrigger>
                      <SelectContent>
                        {groupOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{`${t('剩余额度')}${renderQuotaWithPrompt(quota)}`}</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder={t('请输入新的剩余额度')}
                        value={quota}
                        onChange={(e) => handleInputChange('quota', e.target.value)}
                        autoComplete="new-password"
                      />
                      <Button variant="outline" onClick={openAddQuotaModal}>
                        {t('添加额度')}
                      </Button>
                    </div>
                  </div>
                </>
              )}
              
              <Separator />
              <p className="text-sm text-muted-foreground">{t('以下信息不可修改')}</p>
              
              <div className="space-y-2">
                <Label htmlFor="github_id">{t('已绑定的 GitHub 账户')}</Label>
                <Input
                  id="github_id"
                  value={github_id}
                  placeholder={t('此项只读，需要用户通过个人设置页面的相关绑定按钮进行绑定，不可直接修改')}
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="oidc_id">{t('已绑定的 OIDC 账户')}</Label>
                <Input
                  id="oidc_id"
                  value={oidc_id}
                  placeholder={t('此项只读，需要用户通过个人设置页面的相关绑定按钮进行绑定，不可直接修改')}
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wechat_id">{t('已绑定的微信账户')}</Label>
                <Input
                  id="wechat_id"
                  value={wechat_id}
                  placeholder={t('此项只读，需要用户通过个人设置页面的相关绑定按钮进行绑定，不可直接修改')}
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('已绑定的邮箱账户')}</Label>
                <Input
                  id="email"
                  value={email}
                  placeholder={t('此项只读，需要用户通过个人设置页面的相关绑定按钮进行绑定，不可直接修改')}
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telegram_id">{t('已绑定的Telegram账户')}</Label>
                <Input
                  id="telegram_id"
                  value={telegram_id}
                  placeholder={t('此项只读，需要用户通过个人设置页面的相关绑定按钮进行绑定，不可直接修改')}
                  disabled
                />
              </div>
            </div>
          )}
          
          <SheetFooter className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              {t('取消')}
            </Button>
            <Button onClick={submit} disabled={loading}>
              {t('提交')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      <Dialog open={addQuotaModalOpen} onOpenChange={setAddQuotaModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('添加额度')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-sm">
              {`${t('新额度')}${renderQuota(quota)} + ${renderQuota(addQuotaLocal)} = ${renderQuota(parseInt(quota) + parseInt(addQuotaLocal || 0))}`}
            </div>
            
            <Input
              type="number"
              placeholder={t('需要添加的额度（支持负数）')}
              value={addQuotaLocal}
              onChange={(e) => setAddQuotaLocal(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddQuotaModalOpen(false)}>
              {t('取消')}
            </Button>
            <Button onClick={() => {
              addLocalQuota();
              setAddQuotaModalOpen(false);
            }}>
              {t('确定')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditUser;
