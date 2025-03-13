import {
  API,
  isMobile,
  showError,
  showSuccess,
  timestamp2string,
} from '../../helpers';
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../../components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover"
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
import { renderGroupOption, renderQuotaWithPrompt } from '../../helpers/render';

// Shadcn UI components
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Textarea } from "../../components/ui/textarea";
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EditToken = (props) => {
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const originInputs = {
    name: '',
    remain_quota: isEdit ? 0 : 500000,
    expired_time: -1,
    unlimited_quota: false,
    model_limits_enabled: false,
    model_limits: [],
    allow_ips: '',
    group: '',
  };
  const [inputs, setInputs] = useState(originInputs);
  const {
    name,
    remain_quota,
    expired_time,
    unlimited_quota,
    model_limits_enabled,
    model_limits,
    allow_ips,
    group
  } = inputs;
  const [models, setModels] = useState([]);
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const handleInputChange = (name, value) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };
  
  const handleCancel = () => {
    props.handleClose();
  };
  
  const setExpiredTime = (month, day, hour, minute) => {
    let now = new Date();
    let timestamp = now.getTime() / 1000;
    let seconds = month * 30 * 24 * 60 * 60;
    seconds += day * 24 * 60 * 60;
    seconds += hour * 60 * 60;
    seconds += minute * 60;
    if (seconds !== 0) {
      timestamp += seconds;
      setInputs({ ...inputs, expired_time: timestamp2string(timestamp) });
    } else {
      setInputs({ ...inputs, expired_time: -1 });
    }
  };

  const setUnlimitedQuota = () => {
    setInputs({ ...inputs, unlimited_quota: !unlimited_quota });
  };

  const loadModels = async () => {
    let res = await API.get(`/api/user/models`);
    const { success, message, data } = res.data;
    if (success) {
      let localModelOptions = data.map((model) => ({
        label: model,
        value: model,
      }));
      setModels(localModelOptions);
    } else {
      showError(t(message));
    }
  };

  const loadGroups = async () => {
    let res = await API.get(`/api/user/self/groups`);
    const { success, message, data } = res.data;
    if (success) {
      let localGroupOptions = Object.entries(data).map(([group, info]) => ({
        label: info.desc,
        value: group,
        ratio: info.ratio
      }));
      setGroups(localGroupOptions);
    } else {
      showError(t(message));
    }
  };

  const loadToken = async () => {
    setLoading(true);
    let res = await API.get(`/api/token/${props.editingToken.id}`);
    const { success, message, data } = res.data;
    if (success) {
      if (data.expired_time !== -1) {
        data.expired_time = timestamp2string(data.expired_time);
      }
      if (data.model_limits !== '') {
        data.model_limits = data.model_limits.split(',');
      } else {
        data.model_limits = [];
      }
      setInputs(data);
    } else {
      showError(message);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    setIsEdit(props.editingToken.id !== undefined);
  }, [props.editingToken.id]);

  useEffect(() => {
    if (!isEdit) {
      setInputs(originInputs);
    } else {
      loadToken().then(() => {
        // console.log(inputs);
      });
    }
    loadModels();
    loadGroups();
  }, [isEdit]);

  // 新增 state 变量 tokenCount 来记录用户想要创建的令牌数量，默认为 1
  const [tokenCount, setTokenCount] = useState(1);

  // 新增处理 tokenCount 变化的函数
  const handleTokenCountChange = (value) => {
    // 确保用户输入的是正整数
    const count = parseInt(value, 10);
    if (!isNaN(count) && count > 0) {
      setTokenCount(count);
    }
  };

  // 生成一个随机的四位字母数字字符串
  const generateRandomSuffix = () => {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  };

  const submit = async () => {
    setLoading(true);
    if (isEdit) {
      // 编辑令牌的逻辑保持不变
      let localInputs = { ...inputs };
      localInputs.remain_quota = parseInt(localInputs.remain_quota);
      if (localInputs.expired_time !== -1) {
        let time = Date.parse(localInputs.expired_time);
        if (isNaN(time)) {
          showError(t('过期时间格式错误！'));
          setLoading(false);
          return;
        }
        localInputs.expired_time = Math.ceil(time / 1000);
      }
      localInputs.model_limits = localInputs.model_limits.join(',');
      let res = await API.put(`/api/token/`, {
        ...localInputs,
        id: parseInt(props.editingToken.id),
      });
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('令牌更新成功！'));
        props.refresh();
        props.handleClose();
      } else {
        showError(t(message));
      }
    } else {
      // 处理新增多个令牌的情况
      let successCount = 0; // 记录成功创建的令牌数量
      for (let i = 0; i < tokenCount; i++) {
        let localInputs = { ...inputs };
        if (i !== 0) {
          // 如果用户想要创建多个令牌，则给每个令牌一个序号后缀
          localInputs.name = `${inputs.name}-${generateRandomSuffix()}`;
        }
        localInputs.remain_quota = parseInt(localInputs.remain_quota);

        if (localInputs.expired_time !== -1) {
          let time = Date.parse(localInputs.expired_time);
          if (isNaN(time)) {
            showError(t('过期时间格式错误！'));
            setLoading(false);
            break;
          }
          localInputs.expired_time = Math.ceil(time / 1000);
        }
        localInputs.model_limits = localInputs.model_limits.join(',');
        let res = await API.post(`/api/token/`, localInputs);
        const { success, message } = res.data;

        if (success) {
          successCount++;
        } else {
          showError(t(message));
          break; // 如果创建失败，终止循环
        }
      }

      if (successCount > 0) {
        showSuccess(
          t('令牌创建成功，请在列表页面点击复制获取令牌！')
        );
        props.refresh();
        props.handleClose();
      }
    }
    setLoading(false);
    setInputs(originInputs); // 重置表单
    setTokenCount(1); // 重置数量为默认值
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

  return (
    <>
      <Sheet
        open={props.visiable}
        onOpenChange={props.handleClose}
      >
        <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEdit ? t('更新令牌信息') : t('创建新的令牌')}</SheetTitle>
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
                <Label htmlFor="expired_time">{t('过期时间')}</Label>
                <div className="flex flex-col space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !expired_time && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expired_time && expired_time !== -1 ? 
                          expired_time : 
                          t('请选择过期时间')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={expired_time !== -1 ? new Date(expired_time) : undefined}
                        onSelect={(date) => handleInputChange(
                          'expired_time', 
                          date ? timestamp2string(date.getTime() / 1000) : -1
                        )}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpiredTime(0, 0, 0, 0)}
                    >
                      {t('永不过期')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpiredTime(0, 0, 1, 0)}
                    >
                      {t('一小时')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpiredTime(0, 1, 0, 0)}
                    >
                      {t('一天')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpiredTime(1, 0, 0, 0)}
                    >
                      {t('一个月')}
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <Alert>
                <AlertDescription>
                  {t('注意，令牌的额度仅用于限制令牌本身的最大额度使用量，实际的使用受到账户的剩余额度限制。')}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label>{`${t('额度')}${renderQuotaWithPrompt(remain_quota)}`}</Label>
                <div className="flex flex-col space-y-2">
                  <Select
                    value={remain_quota.toString()}
                    onValueChange={(value) => handleInputChange('remain_quota', value)}
                    disabled={unlimited_quota}
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
                    value={remain_quota}
                    onChange={(e) => handleInputChange('remain_quota', e.target.value)}
                    disabled={unlimited_quota}
                  />
                </div>
              </div>
              
              {!isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="token_count">{t('新建数量')}</Label>
                  <Select
                    value={tokenCount.toString()}
                    onValueChange={(value) => handleTokenCountChange(value)}
                  >
                    <SelectTrigger id="token_count">
                      <SelectValue placeholder={t('请选择新建数量')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="10">{t('10个')}</SelectItem>
                      <SelectItem value="20">{t('20个')}</SelectItem>
                      <SelectItem value="30">{t('30个')}</SelectItem>
                      <SelectItem value="100">{t('100个')}</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    placeholder={t('或直接输入数量')}
                    value={tokenCount}
                    onChange={(e) => handleTokenCountChange(e.target.value)}
                  />
                </div>
              )}
              
              <div>
                <Button
                  variant={unlimited_quota ? "default" : "outline"}
                  onClick={setUnlimitedQuota}
                >
                  {unlimited_quota ? t('取消无限额度') : t('设为无限额度')}
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="allow_ips">{t('IP白名单（请勿过度信任此功能）')}</Label>
                <Textarea
                  id="allow_ips"
                  placeholder={t('允许的IP，一行一个，不填写则不限制')}
                  value={allow_ips}
                  onChange={(e) => handleInputChange('allow_ips', e.target.value)}
                  className="font-mono"
                  rows={4}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="model_limits_enabled"
                  checked={model_limits_enabled}
                  onCheckedChange={(checked) => 
                    handleInputChange('model_limits_enabled', checked)
                  }
                />
                <Label
                  htmlFor="model_limits_enabled"
                  className="cursor-pointer"
                >
                  {t('启用模型限制（非必要，不建议启用）')}
                </Label>
              </div>
              
              <div className="space-y-2">
                <Select
                  value={undefined}
                  onValueChange={(value) => {
                    // For a multiselect, we need to handle array values
                    const newModelLimits = [...model_limits];
                    if (!newModelLimits.includes(value)) {
                      newModelLimits.push(value);
                      handleInputChange('model_limits', newModelLimits);
                    }
                  }}
                  disabled={!model_limits_enabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('请选择该渠道所支持的模型')} />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem 
                        key={model.value} 
                        value={model.value}
                        disabled={model_limits.includes(model.value)}
                      >
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {model_limits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {model_limits.map((model) => (
                      <div 
                        key={model}
                        className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md"
                      >
                        <span>{model}</span>
                        <button
                          onClick={() => {
                            const newModelLimits = model_limits.filter(
                              (m) => m !== model
                            );
                            handleInputChange('model_limits', newModelLimits);
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="group">{t('令牌分组，默认为用户的分组')}</Label>
                {groups.length > 0 ? (
                  <Select
                    value={group}
                    onValueChange={(value) => handleInputChange('group', value)}
                  >
                    <SelectTrigger id="group">
                      <SelectValue placeholder={t('令牌分组，默认为用户的分组')} />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} {option.ratio && `(${option.ratio})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="group"
                    disabled
                    placeholder={t('管理员未设置用户可选分组')}
                  />
                )}
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
    </>
  );
};

export default EditToken;
