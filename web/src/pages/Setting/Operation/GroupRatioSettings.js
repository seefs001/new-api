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

export default function GroupRatioSettings(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    GroupRatio: '',
    UserUsableGroups: '',
  });
  const [inputsRow, setInputsRow] = useState(inputs);
  const [validationErrors, setValidationErrors] = useState({});

  function onSubmit() {
    // First validate all JSON fields
    const errors = {};
    if (!verifyJSON(inputs.GroupRatio)) {
      errors.GroupRatio = t('不是合法的 JSON 字符串');
    }
    if (!verifyJSON(inputs.UserUsableGroups)) {
      errors.UserUsableGroups = t('不是合法的 JSON 字符串');
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
            <CardTitle>{t('分组倍率设置')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="GroupRatio">{t('分组倍率')}</Label>
                  <Textarea
                    id="GroupRatio"
                    value={inputs.GroupRatio}
                    onChange={(e) => 
                      setInputs({
                        ...inputs,
                        GroupRatio: e.target.value,
                      })
                    }
                    placeholder={t('为一个 JSON 文本，键为分组ID，值为倍率')}
                    rows={6}
                    className={`font-mono resize-y ${validationErrors.GroupRatio ? "border-destructive" : ""}`}
                  />
                  {validationErrors.GroupRatio && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{validationErrors.GroupRatio}</AlertDescription>
                    </Alert>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('为一个 JSON 文本，键为分组ID，值为倍率')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="UserUsableGroups">{t('用户可用分组')}</Label>
                  <Textarea
                    id="UserUsableGroups"
                    value={inputs.UserUsableGroups}
                    onChange={(e) => 
                      setInputs({
                        ...inputs,
                        UserUsableGroups: e.target.value,
                      })
                    }
                    placeholder={t('为一个 JSON 文本，键为分组ID，值为可用的分组ID数组')}
                    rows={6}
                    className={`font-mono resize-y ${validationErrors.UserUsableGroups ? "border-destructive" : ""}`}
                  />
                  {validationErrors.UserUsableGroups && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{validationErrors.UserUsableGroups}</AlertDescription>
                    </Alert>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('为一个 JSON 文本，键为分组ID，值为可用的分组ID数组')}
                  </p>
                </div>
              </div>
              
              <Button onClick={onSubmit} className="mt-4">
                {t('保存分组倍率设置')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
} 