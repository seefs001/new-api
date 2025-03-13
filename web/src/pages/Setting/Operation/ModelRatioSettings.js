import {
  API,
  compareObjects,
  showError,
  showSuccess,
  showWarning,
  verifyJSON
} from '../../../helpers';
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import React, { useEffect, useRef, useState } from 'react';

import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Loader2 } from "lucide-react";
import { Textarea } from "../../../components/ui/textarea";
import { useTranslation } from 'react-i18next';

export default function ModelRatioSettings(props) {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({
    ModelRatio: '',
    ModelPrice: '',
    CompletionRatio: '',
    CacheRatio: '',
  });
  const [inputsRow, setInputsRow] = useState(inputs);
  const [validationErrors, setValidationErrors] = useState({});

  function onSubmit() {
    // First validate all JSON fields
    const errors = {};
    if (!verifyJSON(inputs.ModelRatio)) {
      errors.ModelRatio = t('不是合法的 JSON 字符串');
    }
    if (!verifyJSON(inputs.ModelPrice)) {
      errors.ModelPrice = t('不是合法的 JSON 字符串');
    }
    if (!verifyJSON(inputs.CompletionRatio)) {
      errors.CompletionRatio = t('不是合法的 JSON 字符串');
    }
    if (!verifyJSON(inputs.CacheRatio)) {
      errors.CacheRatio = t('不是合法的 JSON 字符串');
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});
    
    const updateArray = compareObjects(inputs, inputsRow);
    if (!updateArray.length) return showWarning(t('你似乎并没有修改什么'));
    const requestQueue = updateArray.map((item) => {
      return API.put('/api/option/', {
        key: item.key,
        value: inputs[item.key],
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

  async function resetModelRatio() {
    try {
      let res = await API.post(`/api/option/reset_model_ratio`);
      if (res.data.success) {
        showSuccess(res.data.message);
        props.refresh();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(error);
    }
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
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('模型倍率设置')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={resetModelRatio} 
                  className="mb-4"
                >
                  {t('重置为默认倍率')}
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ModelRatio">{t('模型倍率')}</Label>
                  <Textarea
                    id="ModelRatio"
                    value={inputs.ModelRatio}
                    onChange={(e) => 
                      setInputs({
                        ...inputs,
                        ModelRatio: e.target.value,
                      })
                    }
                    placeholder={t('为一个 JSON 文本，键为模型名称，值为倍率')}
                    rows={6}
                    className={`font-mono resize-y ${validationErrors.ModelRatio ? "border-destructive" : ""}`}
                  />
                  {validationErrors.ModelRatio && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{validationErrors.ModelRatio}</AlertDescription>
                    </Alert>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('为一个 JSON 文本，键为模型名称，值为倍率')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ModelPrice">{t('模型价格')}</Label>
                  <Textarea
                    id="ModelPrice"
                    value={inputs.ModelPrice}
                    onChange={(e) => 
                      setInputs({
                        ...inputs,
                        ModelPrice: e.target.value,
                      })
                    }
                    placeholder={t('为一个 JSON 文本，键为模型名称，值为价格')}
                    rows={6}
                    className={`font-mono resize-y ${validationErrors.ModelPrice ? "border-destructive" : ""}`}
                  />
                  {validationErrors.ModelPrice && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{validationErrors.ModelPrice}</AlertDescription>
                    </Alert>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('为一个 JSON 文本，键为模型名称，值为价格')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="CacheRatio">{t('提示缓存倍率')}</Label>
                  <Textarea
                    id="CacheRatio"
                    value={inputs.CacheRatio}
                    onChange={(e) => 
                      setInputs({
                        ...inputs,
                        CacheRatio: e.target.value,
                      })
                    }
                    placeholder={t('为一个 JSON 文本，键为模型名称，值为倍率')}
                    rows={6}
                    className={`font-mono resize-y ${validationErrors.CacheRatio ? "border-destructive" : ""}`}
                  />
                  {validationErrors.CacheRatio && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{validationErrors.CacheRatio}</AlertDescription>
                    </Alert>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('为一个 JSON 文本，键为模型名称，值为倍率')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="CompletionRatio">{t('模型补全倍率（仅对自定义模型有效）')}</Label>
                  <Textarea
                    id="CompletionRatio"
                    value={inputs.CompletionRatio}
                    onChange={(e) => 
                      setInputs({
                        ...inputs,
                        CompletionRatio: e.target.value,
                      })
                    }
                    placeholder={t('为一个 JSON 文本，键为模型名称，值为倍率')}
                    rows={6}
                    className={`font-mono resize-y ${validationErrors.CompletionRatio ? "border-destructive" : ""}`}
                  />
                  {validationErrors.CompletionRatio && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{validationErrors.CompletionRatio}</AlertDescription>
                    </Alert>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('仅对自定义模型有效')}
                  </p>
                </div>
              </div>
              
              <Button onClick={onSubmit} className="mt-4">
                {t('保存模型倍率设置')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
} 