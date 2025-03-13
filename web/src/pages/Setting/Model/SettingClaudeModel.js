import {
  API,
  compareObjects,
  showError,
  showSuccess,
  showWarning,
  verifyJSON
} from '../../../helpers';
import { Alert, AlertDescription } from "../../../components/ui/alert";
import React, { useEffect, useState } from 'react';

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Loader2 } from "lucide-react";
import { Switch } from "../../../components/ui/switch";
import { Textarea } from "../../../components/ui/textarea";
import { useTranslation } from 'react-i18next';

const CLAUDE_HEADER = {
  'claude-3-7-sonnet-20250219-thinking': {
    'anthropic-beta': ['output-128k-2025-02-19', 'token-efficient-tools-2025-02-19'],
  }
};

const CLAUDE_DEFAULT_MAX_TOKENS = {
  'default': 8192,
  "claude-3-haiku-20240307": 4096,
  "claude-3-opus-20240229": 4096,
  'claude-3-7-sonnet-20250219-thinking': 8192,
}

export default function SettingClaudeModel(props) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    'claude.model_headers_settings': '',
    'claude.thinking_adapter_enabled': true,
    'claude.default_max_tokens': '',
    'claude.thinking_adapter_budget_tokens_percentage': 0.8,
  });
  const [inputsRow, setInputsRow] = useState(inputs);
  const [validationErrors, setValidationErrors] = useState({});

  function onSubmit() {
    // First validate all JSON fields
    const errors = {};
    if (!verifyJSON(inputs['claude.model_headers_settings'])) {
      errors['claude.model_headers_settings'] = t('不是合法的 JSON 字符串');
    }
    if (!verifyJSON(inputs['claude.default_max_tokens'])) {
      errors['claude.default_max_tokens'] = t('不是合法的 JSON 字符串');
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});
    
    const updateArray = compareObjects(inputs, inputsRow);
    if (!updateArray.length) return showWarning(t('你似乎并没有修改什么'));
    const requestQueue = updateArray.map((item) => {
      let value = String(inputs[item.key]);
      
      return API.put('/api/option/', {
        key: item.key,
        value,
      });
    });
    setLoading(true);
    Promise.all(requestQueue)
      .then((res) => {
        if (requestQueue.length === 1) {
          if (res.includes(undefined)) return;
        } else if (requestQueue.length > 1) {
          if (res.includes(undefined)) return showError(t('部分保存失败，请重试'));
        }
        showSuccess(t('保存成功'));
        props.refresh();
      })
      .catch(() => {
        showError(t('保存失败，请重试'));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    const currentInputs = {};
    for (let key in props.options) {
      if (Object.keys(inputs).includes(key)) {
        currentInputs[key] = props.options[key];
      }
    }
    setInputs(currentInputs);
    setInputsRow(structuredClone(currentInputs));
  }, [props.options]);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">{t('Claude设置')}</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="claude-headers-settings">{t('Claude请求头覆盖')}</Label>
              <Textarea
                id="claude-headers-settings"
                value={inputs['claude.model_headers_settings']}
                onChange={(e) => 
                  setInputs({
                    ...inputs,
                    'claude.model_headers_settings': e.target.value,
                  })
                }
                placeholder={t('为一个 JSON 文本，例如：') + '\n' + JSON.stringify(CLAUDE_HEADER, null, 2)}
                rows={6}
                className={`font-mono resize-y ${validationErrors['claude.model_headers_settings'] ? "border-destructive" : ""}`}
              />
              {validationErrors['claude.model_headers_settings'] && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{validationErrors['claude.model_headers_settings']}</AlertDescription>
                </Alert>
              )}
              <p className="text-sm text-muted-foreground">
                {t('示例') + '\n' + JSON.stringify(CLAUDE_HEADER, null, 2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="claude-max-tokens">{t('缺省 MaxTokens')}</Label>
              <Textarea
                id="claude-max-tokens"
                value={inputs['claude.default_max_tokens']}
                onChange={(e) => 
                  setInputs({
                    ...inputs,
                    'claude.default_max_tokens': e.target.value,
                  })
                }
                placeholder={t('为一个 JSON 文本，例如：') + '\n' + JSON.stringify(CLAUDE_DEFAULT_MAX_TOKENS, null, 2)}
                rows={6}
                className={`font-mono resize-y ${validationErrors['claude.default_max_tokens'] ? "border-destructive" : ""}`}
              />
              {validationErrors['claude.default_max_tokens'] && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{validationErrors['claude.default_max_tokens']}</AlertDescription>
                </Alert>
              )}
              <p className="text-sm text-muted-foreground">
                {t('示例') + '\n' + JSON.stringify(CLAUDE_DEFAULT_MAX_TOKENS, null, 2)}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="claude-thinking-adapter"
                  checked={inputs['claude.thinking_adapter_enabled']}
                  onCheckedChange={(checked) => 
                    setInputs({
                      ...inputs,
                      'claude.thinking_adapter_enabled': checked,
                    })
                  }
                />
                <Label htmlFor="claude-thinking-adapter">
                  {t('启用Claude思考适配（-thinking后缀）')}
                </Label>
              </div>
              
              <p className="text-sm pl-6">
                {t('Claude思考适配 BudgetTokens = MaxTokens * BudgetTokens 百分比')}
              </p>

              <div className="space-y-2">
                <Label htmlFor="claude-budget-percentage">{t('思考适配 BudgetTokens 百分比')}</Label>
                <Input
                  id="claude-budget-percentage"
                  type="number"
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={inputs['claude.thinking_adapter_budget_tokens_percentage']}
                  onChange={(e) => 
                    setInputs({
                      ...inputs,
                      'claude.thinking_adapter_budget_tokens_percentage': parseFloat(e.target.value),
                    })
                  }
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground">
                  {t('0.1-1之间的小数')}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={onSubmit} className="mt-6">
            {t('保存')}
          </Button>
        </div>
      )}
    </>
  );
}
