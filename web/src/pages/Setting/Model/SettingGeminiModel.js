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
import { Label } from "../../../components/ui/label";
import { Loader2 } from "lucide-react";
import { Textarea } from "../../../components/ui/textarea";
import { useTranslation } from 'react-i18next';

const GEMINI_SETTING_EXAMPLE = {
  'default': 'OFF',
  'HARM_CATEGORY_CIVIC_INTEGRITY': 'BLOCK_NONE',
};

const GEMINI_VERSION_EXAMPLE = {
  'default': 'v1beta',
};

export default function SettingGeminiModel(props) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    'gemini.safety_settings': '',
    'gemini.version_settings': '',
  });
  const [inputsRow, setInputsRow] = useState(inputs);
  const [validationErrors, setValidationErrors] = useState({});

  function onSubmit() {
    // First validate all JSON fields
    const errors = {};
    if (!verifyJSON(inputs['gemini.safety_settings'])) {
      errors['gemini.safety_settings'] = t('不是合法的 JSON 字符串');
    }
    if (!verifyJSON(inputs['gemini.version_settings'])) {
      errors['gemini.version_settings'] = t('不是合法的 JSON 字符串');
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});
    
    const updateArray = compareObjects(inputs, inputsRow);
    if (!updateArray.length) return showWarning(t('你似乎并没有修改什么'));
    const requestQueue = updateArray.map((item) => {
      let value = '';
      if (typeof inputs[item.key] === 'boolean') {
        value = String(inputs[item.key]);
      } else {
        value = inputs[item.key];
      }
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
          <h3 className="text-lg font-medium">{t('Gemini设置')}</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="gemini-safety-settings">{t('Gemini安全设置')}</Label>
              <Textarea
                id="gemini-safety-settings"
                value={inputs['gemini.safety_settings']}
                onChange={(e) => 
                  setInputs({
                    ...inputs,
                    'gemini.safety_settings': e.target.value,
                  })
                }
                placeholder={t('为一个 JSON 文本，例如：') + '\n' + JSON.stringify(GEMINI_SETTING_EXAMPLE, null, 2)}
                rows={6}
                className={`font-mono resize-y ${validationErrors['gemini.safety_settings'] ? "border-destructive" : ""}`}
              />
              {validationErrors['gemini.safety_settings'] && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{validationErrors['gemini.safety_settings']}</AlertDescription>
                </Alert>
              )}
              <p className="text-sm text-muted-foreground">
                {t('default为默认设置，可单独设置每个分类的安全等级')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gemini-version-settings">{t('Gemini版本设置')}</Label>
              <Textarea
                id="gemini-version-settings"
                value={inputs['gemini.version_settings']}
                onChange={(e) => 
                  setInputs({
                    ...inputs,
                    'gemini.version_settings': e.target.value,
                  })
                }
                placeholder={t('为一个 JSON 文本，例如：') + '\n' + JSON.stringify(GEMINI_VERSION_EXAMPLE, null, 2)}
                rows={6}
                className={`font-mono resize-y ${validationErrors['gemini.version_settings'] ? "border-destructive" : ""}`}
              />
              {validationErrors['gemini.version_settings'] && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{validationErrors['gemini.version_settings']}</AlertDescription>
                </Alert>
              )}
              <p className="text-sm text-muted-foreground">
                {t('default为默认设置，可单独设置每个模型的版本')}
              </p>
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
