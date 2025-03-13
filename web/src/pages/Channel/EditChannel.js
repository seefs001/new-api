import {
  API,
  isMobile,
  showError,
  showInfo,
  showSuccess,
  verifyJSON
} from '../../helpers';
import { Alert, AlertDescription } from "../../components/ui/alert";
import React, { useEffect, useRef, useState } from 'react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { getChannelModels, loadChannelModels } from '../../components/utils.js';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from "../../components/ui/button";
import { CHANNEL_OPTIONS } from '../../constants';
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Loader2 } from "lucide-react";
import { Separator } from "../../components/ui/separator";
import { Textarea } from "../../components/ui/textarea";
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const MODEL_MAPPING_EXAMPLE = {
  'gpt-3.5-turbo': 'gpt-3.5-turbo-0125'
};

const STATUS_CODE_MAPPING_EXAMPLE = {
  400: '500'
};

const REGION_EXAMPLE = {
  'default': 'us-central1',
  'claude-3-5-sonnet-20240620': 'europe-west1'
};

const fetchButtonTips = '1. 新建渠道时，请求通过当前浏览器发出；2. 编辑已有渠道，请求通过后端服务器发出';

function type2secretPrompt(type) {
  // inputs.type === 15 ? '按照如下格式输入：APIKey|SecretKey' : (inputs.type === 18 ? '按照如下格式输入：APPID|APISecret|APIKey' : '请输入渠道对应的鉴权密钥')
  switch (type) {
    case 15:
      return '按照如下格式输入：APIKey|SecretKey';
    case 18:
      return '按照如下格式输入：APPID|APISecret|APIKey';
    case 22:
      return '按照如下格式输入：APIKey-AppId，例如：fastgpt-0sp2gtvfdgyi4k30jwlgwf1i-64f335d84283f05518e9e041';
    case 23:
      return '按照如下格式输入：AppId|SecretId|SecretKey';
    case 33:
      return '按照如下格式输入：Ak|Sk|Region';
    default:
      return '请输入渠道对应的鉴权密钥';
  }
}

const EditChannel = (props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const channelId = props.editingChannel.id;
  const isEdit = channelId !== undefined;
  const [loading, setLoading] = useState(isEdit);
  const handleCancel = () => {
    props.handleClose();
  };
  const originInputs = {
    name: '',
    type: 1,
    key: '',
    openai_organization: '',
    max_input_tokens: 0,
    base_url: '',
    other: '',
    model_mapping: '',
    status_code_mapping: '',
    models: [],
    auto_ban: 1,
    test_model: '',
    groups: ['default'],
    priority: 0,
    weight: 0,
    tag: ''
  };
  const [batch, setBatch] = useState(false);
  const [autoBan, setAutoBan] = useState(true);
  // const [autoBan, setAutoBan] = useState(true);
  const [inputs, setInputs] = useState(originInputs);
  const [originModelOptions, setOriginModelOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [basicModels, setBasicModels] = useState([]);
  const [fullModels, setFullModels] = useState([]);
  const [customModel, setCustomModel] = useState('');
  const handleInputChange = (name, value) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
    if (name === 'type') {
      let localModels = [];
      switch (value) {
        case 2:
          localModels = [
            'mj_imagine',
            'mj_variation',
            'mj_reroll',
            'mj_blend',
            'mj_upscale',
            'mj_describe',
            'mj_uploads'
          ];
          break;
        case 5:
          localModels = [
            'swap_face',
            'mj_imagine',
            'mj_variation',
            'mj_reroll',
            'mj_blend',
            'mj_upscale',
            'mj_describe',
            'mj_zoom',
            'mj_shorten',
            'mj_modal',
            'mj_inpaint',
            'mj_custom_zoom',
            'mj_high_variation',
            'mj_low_variation',
            'mj_pan',
            'mj_uploads'
          ];
          break;
        case 36:
          localModels = [
            'suno_music',
            'suno_lyrics'
          ];
          break;
        default:
          localModels = getChannelModels(value);
          break;
      }
      if (inputs.models.length === 0) {
        setInputs((inputs) => ({ ...inputs, models: localModels }));
      }
      setBasicModels(localModels);
    }
    //setAutoBan
  };

  const loadChannel = async () => {
    setLoading(true);
    let res = await API.get(`/api/channel/${channelId}`);
    if (res === undefined) {
      return;
    }
    const { success, message, data } = res.data;
    if (success) {
      if (data.models === '') {
        data.models = [];
      } else {
        data.models = data.models.split(',');
      }
      if (data.group === '') {
        data.groups = [];
      } else {
        data.groups = data.group.split(',');
      }
      if (data.model_mapping !== '') {
        data.model_mapping = JSON.stringify(
          JSON.parse(data.model_mapping),
          null,
          2
        );
      }
      setInputs(data);
      if (data.auto_ban === 0) {
        setAutoBan(false);
      } else {
        setAutoBan(true);
      }
      setBasicModels(getChannelModels(data.type));
      // console.log(data);
    } else {
      showError(message);
    }
    setLoading(false);
  };


  const fetchUpstreamModelList = async (name) => {
    // if (inputs['type'] !== 1) {
    //   showError(t('仅支持 OpenAI 接口格式'));
    //   return;
    // }
    setLoading(true);
    const models = inputs['models'] || [];
    let err = false;

    if (isEdit) {
      // 如果是编辑模式，使用已有的channel id获取模型列表
      const res = await API.get('/api/channel/fetch_models/' + channelId);
      if (res.data && res.data?.success) {
        models.push(...res.data.data);
      } else {
        err = true;
      }
    } else {
      // 如果是新建模式，通过后端代理获取模型列表
      if (!inputs?.['key']) {
        showError(t('请填写密钥'));
        err = true;
      } else {
        try {
          const res = await API.post('/api/channel/fetch_models', {
            base_url: inputs['base_url'],
            type: inputs['type'],
            key: inputs['key']
          });
          
          if (res.data && res.data.success) {
            models.push(...res.data.data);
          } else {
            err = true;
          }
        } catch (error) {
          console.error('Error fetching models:', error);
          err = true;
        }
      }
    }

    if (!err) {
      handleInputChange(name, Array.from(new Set(models)));
      showSuccess(t('获取模型列表成功'));
    } else {
      showError(t('获取模型列表失败'));
    }
    setLoading(false);
  };

  const fetchModels = async () => {
    try {
      let res = await API.get(`/api/channel/models`);
      let localModelOptions = res.data.data.map((model) => ({
        label: model.id,
        value: model.id
      }));
      setOriginModelOptions(localModelOptions);
      setFullModels(res.data.data.map((model) => model.id));
      setBasicModels(
        res.data.data
          .filter((model) => {
            return model.id.startsWith('gpt-') || model.id.startsWith('text-');
          })
          .map((model) => model.id)
      );
    } catch (error) {
      showError(error.message);
    }
  };

  const fetchGroups = async () => {
    try {
      let res = await API.get(`/api/group/`);
      if (res === undefined) {
        return;
      }
      setGroupOptions(
        res.data.data.map((group) => ({
          label: group,
          value: group
        }))
      );
    } catch (error) {
      showError(error.message);
    }
  };

  useEffect(() => {
    let localModelOptions = [...originModelOptions];
    inputs.models.forEach((model) => {
      if (!localModelOptions.find((option) => option.label === model)) {
        localModelOptions.push({
          label: model,
          value: model
        });
      }
    });
    setModelOptions(localModelOptions);
  }, [originModelOptions, inputs.models]);

  useEffect(() => {
    fetchModels().then();
    fetchGroups().then();
    if (isEdit) {
      loadChannel().then(() => {});
    } else {
      setInputs(originInputs);
      let localModels = getChannelModels(inputs.type);
      setBasicModels(localModels);
      setInputs((inputs) => ({ ...inputs, models: localModels }));
    }
  }, [props.editingChannel.id]);

  const submit = async () => {
    if (!isEdit && (inputs.name === '' || inputs.key === '')) {
      showInfo(t('请填写渠道名称和渠道密钥！'));
      return;
    }
    if (inputs.models.length === 0) {
      showInfo(t('请至少选择一个模型！'));
      return;
    }
    if (inputs.model_mapping !== '' && !verifyJSON(inputs.model_mapping)) {
      showInfo(t('模型映射必须是合法的 JSON 格式！'));
      return;
    }
    let localInputs = { ...inputs };
    if (localInputs.base_url && localInputs.base_url.endsWith('/')) {
      localInputs.base_url = localInputs.base_url.slice(
        0,
        localInputs.base_url.length - 1
      );
    }
    if (localInputs.type === 18 && localInputs.other === '') {
      localInputs.other = 'v2.1';
    }
    let res;
    if (!Array.isArray(localInputs.models)) {
      showError(t('提交失败，请勿重复提交！'));
      handleCancel();
      return;
    }
    localInputs.auto_ban = autoBan ? 1 : 0;
    localInputs.models = localInputs.models.join(',');
    localInputs.group = localInputs.groups.join(',');
    if (isEdit) {
      res = await API.put(`/api/channel/`, {
        ...localInputs,
        id: parseInt(channelId)
      });
    } else {
      res = await API.post(`/api/channel/`, localInputs);
    }
    const { success, message } = res.data;
    if (success) {
      if (isEdit) {
        showSuccess(t('渠道更新成功！'));
      } else {
        showSuccess(t('渠道创建成功！'));
        setInputs(originInputs);
      }
      props.refresh();
      props.handleClose();
    } else {
      showError(message);
    }
  };

  const addCustomModels = () => {
    if (customModel.trim() === '') return;
    const modelArray = customModel.split(',').map((model) => model.trim());

    let localModels = [...inputs.models];
    let localModelOptions = [...modelOptions];
    let hasError = false;

    modelArray.forEach((model) => {
      if (model && !localModels.includes(model)) {
        localModels.push(model);
        localModelOptions.push({
          label: model,
          value: model
        });
      } else if (model) {
        showError(t('某些模型已存在！'));
        hasError = true;
      }
    });

    if (hasError) return;

    setModelOptions(localModelOptions);
    setCustomModel('');
    handleInputChange('models', localModels);
  };

  return (
    <Sheet open={props.visible} onOpenChange={handleCancel}>
      <SheetContent side={isEdit ? "right" : "left"} className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>{isEdit ? t('更新渠道信息') : t('创建新的渠道')}</SheetTitle>
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
                <Label htmlFor="type">{t('类型')}：</Label>
                <Select 
                  value={inputs.type.toString()} 
                  onValueChange={(value) => handleInputChange('type', parseInt(value))}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder={t('请选择渠道类型')} />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNEL_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {inputs.type === 3 && (
                <>
                  <Alert variant="warning">
                    <AlertDescription>
                      {t('注意，模型部署名称必须和模型名称保持一致')}
                    </AlertDescription>
                  </Alert>
                  <div>
                    <Label htmlFor="azure_base_url">AZURE_OPENAI_ENDPOINT：</Label>
                    <Input
                      id="azure_base_url"
                      className="mt-1"
                      placeholder={t('请输入 AZURE_OPENAI_ENDPOINT，例如：https://docs-test-001.openai.azure.com')}
                      onChange={(e) => handleInputChange('base_url', e.target.value)}
                      value={inputs.base_url}
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="azure_other">{t('默认 API 版本')}：</Label>
                    <Input
                      id="azure_other"
                      className="mt-1"
                      placeholder={t('请输入默认 API 版本，例如：2024-12-01-preview')}
                      onChange={(e) => handleInputChange('other', e.target.value)}
                      value={inputs.other}
                      autoComplete="new-password"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="name">{t('名称')}：</Label>
                <Input
                  id="name"
                  className="mt-1"
                  required
                  placeholder={t('请为渠道命名')}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  value={inputs.name}
                  autoComplete="new-password"
                />
              </div>

              {inputs.type !== 3 && inputs.type !== 8 && inputs.type !== 22 && inputs.type !== 36 && inputs.type !== 45 && (
                <div>
                  <Label htmlFor="base_url">{t('代理站地址')}：</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          id="base_url"
                          className="mt-1"
                          placeholder={t('此项可选，用于通过代理站来进行 API 调用，末尾不要带/v1和/')}
                          onChange={(e) => handleInputChange('base_url', e.target.value)}
                          value={inputs.base_url}
                          autoComplete="new-password"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {t('对于官方渠道，new-api已经内置地址，除非是第三方代理站点或者Azure的特殊接入地址，否则不需要填写')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              <div>
                <Label htmlFor="key">{t('密钥')}：</Label>
                {batch ? (
                  <Textarea
                    id="key"
                    className="mt-1 font-mono h-40"
                    required
                    placeholder={t('请输入密钥，一行一个')}
                    onChange={(e) => handleInputChange('key', e.target.value)}
                    value={inputs.key}
                    autoComplete="new-password"
                  />
                ) : (
                  <Input
                    id="key"
                    className="mt-1"
                    required
                    placeholder={t(type2secretPrompt(inputs.type))}
                    onChange={(e) => handleInputChange('key', e.target.value)}
                    value={inputs.key}
                    autoComplete="new-password"
                  />
                )}
              </div>

              {!isEdit && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="batch" 
                    checked={batch}
                    onCheckedChange={() => setBatch(!batch)}
                  />
                  <Label htmlFor="batch" className="font-medium cursor-pointer">
                    {t('批量创建')}
                  </Label>
                </div>
              )}

              <div>
                <Label htmlFor="groups">{t('分组')}：</Label>
                <Select 
                  value={inputs.groups} 
                  onValueChange={(value) => handleInputChange('groups', value)}
                  multiple
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder={t('请选择可以使用该渠道的分组')} />
                  </SelectTrigger>
                  <SelectContent>
                    {groupOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="models">{t('模型')}：</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {inputs.models.map(model => (
                    <div key={model} className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
                      {model}
                      <button 
                        className="ml-1 text-secondary-foreground/70 hover:text-secondary-foreground"
                        onClick={() => {
                          const newModels = inputs.models.filter(m => m !== model);
                          handleInputChange('models', newModels);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    placeholder={t('输入自定义模型名称')}
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value.trim())}
                    className="flex-1"
                  />
                  <Button onClick={addCustomModels} type="button">
                    {t('填入')}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => handleInputChange('models', basicModels)}
                    size="sm"
                  >
                    {t('填入相关模型')}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => handleInputChange('models', fullModels)}
                    size="sm"
                  >
                    {t('填入所有模型')}
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          onClick={() => fetchUpstreamModelList('models')}
                          size="sm"
                        >
                          {t('获取模型列表')}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t('新建渠道时，请求通过当前浏览器发出；编辑已有渠道，请求通过后端服务器发出')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleInputChange('models', [])}
                    size="sm"
                  >
                    {t('清除所有模型')}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="model_mapping">{t('模型重定向')}：</Label>
                <Textarea
                  id="model_mapping"
                  className="mt-1 font-mono"
                  placeholder={t('此项可选，用于修改请求体中的模型名称，为一个 JSON 字符串，键为请求中模型名称，值为要替换的模型名称，例如：') + `\n${JSON.stringify(MODEL_MAPPING_EXAMPLE, null, 2)}`}
                  onChange={(e) => handleInputChange('model_mapping', e.target.value)}
                  value={inputs.model_mapping || ""}
                  rows={6}
                />
                <Button 
                  variant="link" 
                  className="px-0 h-auto" 
                  onClick={() => {
                    handleInputChange(
                      'model_mapping',
                      JSON.stringify(MODEL_MAPPING_EXAMPLE, null, 2)
                    );
                  }}
                >
                  {t('填入模板')}
                </Button>
              </div>

              <div>
                <Label htmlFor="tag">{t('渠道标签')}：</Label>
                <Input
                  id="tag"
                  className="mt-1"
                  placeholder={t('渠道标签')}
                  onChange={(e) => handleInputChange('tag', e.target.value)}
                  value={inputs.tag}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <Label htmlFor="weight">{t('渠道权重')}：</Label>
                <Input
                  id="weight"
                  className="mt-1"
                  placeholder={t('渠道权重')}
                  onChange={(e) => {
                    const number = parseInt(e.target.value);
                    if (isNaN(number)) {
                      handleInputChange('weight', e.target.value);
                    } else {
                      handleInputChange('weight', number);
                    }
                  }}
                  value={inputs.weight}
                  autoComplete="new-password"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="auto_ban" 
                  checked={autoBan}
                  onCheckedChange={() => setAutoBan(!autoBan)}
                />
                <Label htmlFor="auto_ban" className="font-medium cursor-pointer">
                  {t('是否自动禁用（仅当自动禁用开启时有效），关闭后不会自动禁用该渠道')}
                </Label>
              </div>
            </div>
          </div>
        </div>
        
        <SheetFooter className="pt-4 border-t">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              {t('取消')}
            </Button>
            <Button onClick={submit} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('提交')}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditChannel;
