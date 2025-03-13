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

export default function SettingsChats(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    Chats: "[]",
  });
  const [inputsRow, setInputsRow] = useState(inputs);
  const [validationError, setValidationError] = useState("");

  async function onSubmit() {
    try {
      if (!verifyJSON(inputs.Chats)) {
        setValidationError(t('不是合法的 JSON 字符串'));
        return;
      }
      
      setValidationError("");
      
      const updateArray = compareObjects(inputs, inputsRow);
      if (!updateArray.length) return showWarning(t('你似乎并没有修改什么'));
      
      const requestQueue = updateArray.map((item) => {
        let value = inputs[item.key];
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
    } catch (error) {
      showError(t('请检查输入'));
      console.error(error);
    }
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
        if (key === 'Chats') {
          try {
            const obj = JSON.parse(props.options[key]);
            currentInputs[key] = JSON.stringify(obj, null, 2);
          } catch (e) {
            currentInputs[key] = props.options[key];
          }
        } else {
          currentInputs[key] = props.options[key];
        }
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
            <CardTitle>{t('聊天设置')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="Chats">{t('预设聊天')}</Label>
                <Textarea
                  id="Chats"
                  value={inputs.Chats}
                  onChange={(e) => 
                    setInputs({
                      ...inputs,
                      Chats: e.target.value,
                    })
                  }
                  placeholder={t('为一个 JSON 数组，每个元素为一个聊天预设')}
                  rows={10}
                  className={`font-mono resize-y ${validationError ? "border-destructive" : ""}`}
                />
                {validationError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('为一个 JSON 数组，每个元素需要包含 name 和 prompt 字段')}
                </p>
              </div>
              
              <Button onClick={onSubmit} className="mt-4">
                {t('保存聊天设置')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
