import {
  API,
  downloadTextAsFile,
  isMobile,
  showError,
  showSuccess,
} from '../../helpers';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { getQuotaPerUnit, renderQuota, renderQuotaWithPrompt } from '../../helpers/render';
import { useNavigate, useParams } from 'react-router-dom';

// Shadcn UI components
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Loader2 } from "lucide-react";
import { Separator } from "../../components/ui/separator";
import { useTranslation } from 'react-i18next';

const EditRedemption = (props) => {
  const { t } = useTranslation();
  const isEdit = props.editingRedemption.id !== undefined;
  const [loading, setLoading] = useState(isEdit);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [downloadData, setDownloadData] = useState([]);

  const params = useParams();
  const navigate = useNavigate();
  const originInputs = {
    name: '',
    quota: 100000,
    count: 1,
  };
  const [inputs, setInputs] = useState(originInputs);
  const { name, quota, count } = inputs;

  const handleCancel = () => {
    props.handleClose();
  };

  const handleInputChange = (name, value) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const loadRedemption = async () => {
    setLoading(true);
    let res = await API.get(`/api/redemption/${props.editingRedemption.id}`);
    const { success, message, data } = res.data;
    if (success) {
      setInputs(data);
    } else {
      showError(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isEdit) {
      loadRedemption().then(() => {
        // console.log(inputs);
      });
    } else {
      setInputs(originInputs);
    }
  }, [props.editingRedemption.id]);

  const submit = async () => {
    let name = inputs.name;
    if (!isEdit && inputs.name === '') {
      // set default name
      name = renderQuota(quota);
    }
    setLoading(true);
    let localInputs = inputs;
    localInputs.count = parseInt(localInputs.count);
    localInputs.quota = parseInt(localInputs.quota);
    localInputs.name = name;
    let res;
    if (isEdit) {
      res = await API.put(`/api/redemption/`, {
        ...localInputs,
        id: parseInt(props.editingRedemption.id),
      });
    } else {
      res = await API.post(`/api/redemption/`, {
        ...localInputs,
      });
    }
    const { success, message, data } = res.data;
    if (success) {
      if (isEdit) {
        showSuccess(t('兑换码更新成功！'));
        props.refresh();
        props.handleClose();
      } else {
        showSuccess(t('兑换码创建成功！'));
        setInputs(originInputs);
        props.refresh();
        props.handleClose();
      }
    } else {
      showError(message);
    }
    if (!isEdit && data) {
      let text = '';
      for (let i = 0; i < data.length; i++) {
        text += data[i] + '\n';
      }
      setDownloadData(data);
      setShowDownloadDialog(true);
    }
    setLoading(false);
  };

  // Predefined quota options
  const quotaOptions = [
    { value: 500000, label: '1$' },
    { value: 5000000, label: '10$' },
    { value: 25000000, label: '50$' },
    { value: 50000000, label: '100$' },
    { value: 250000000, label: '500$' },
    { value: 500000000, label: '1000$' },
  ];

  const handleDownload = () => {
    let text = '';
    for (let i = 0; i < downloadData.length; i++) {
      text += downloadData[i] + '\n';
    }
    downloadTextAsFile(text, `${inputs.name}.txt`);
    setShowDownloadDialog(false);
  };

  return (
    <>
      <Sheet
        open={props.visiable}
        onOpenChange={props.handleClose}
      >
        <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEdit ? t('更新兑换码信息') : t('创建新的兑换码')}
            </SheetTitle>
          </SheetHeader>
          
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('名称')}</Label>
                <Input
                  id="name"
                  placeholder={t('请输入名称')}
                  value={name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  autoComplete="new-password"
                  required={!isEdit}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>{`${t('额度')} ${renderQuotaWithPrompt(quota)}`}</Label>
                <div className="flex flex-col space-y-2">
                  <Select
                    value={quota.toString()}
                    onValueChange={(value) => handleInputChange('quota', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('请选择额度')} />
                    </SelectTrigger>
                    <SelectContent>
                      {quotaOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label} ({option.value})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    placeholder={t('或直接输入额度')}
                    value={quota}
                    onChange={(e) => handleInputChange('quota', e.target.value)}
                  />
                </div>
              </div>
              
              {!isEdit && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="count">{t('生成数量')}</Label>
                    <Input
                      id="count"
                      type="number"
                      placeholder={t('请输入生成数量')}
                      value={count}
                      onChange={(e) => handleInputChange('count', e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </>
              )}
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
      
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('兑换码创建成功')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('兑换码创建成功，是否下载兑换码？')}</p>
            <p>{t('兑换码将以文本文件的形式下载，文件名为兑换码的名称。')}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDownloadDialog(false)}>
              {t('取消')}
            </Button>
            <Button onClick={handleDownload}>
              {t('下载')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditRedemption;
