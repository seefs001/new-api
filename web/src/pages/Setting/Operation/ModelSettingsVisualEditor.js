import { Clipboard, Plus, Save, Search, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../../../components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../../../components/ui/form';
// ModelSettingsVisualEditor.js
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../../components/ui/table';
import { showError, showSuccess } from '../../../helpers';

import { API } from '../../../helpers';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { useTranslation } from 'react-i18next';

export default function ModelSettingsVisualEditor(props) {
  const { t } = useTranslation();
  const [models, setModels] = useState([]);
  const [visible, setVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    try {
      const modelPrice = JSON.parse(props.options.ModelPrice || '{}');
      const modelRatio = JSON.parse(props.options.ModelRatio || '{}');
      const completionRatio = JSON.parse(props.options.CompletionRatio || '{}');

      // 合并所有模型名称
      const modelNames = new Set([
        ...Object.keys(modelPrice),
        ...Object.keys(modelRatio),
        ...Object.keys(completionRatio)
      ]);

      const modelData = Array.from(modelNames).map(name => ({
        name,
        price: modelPrice[name] === undefined ? '' : modelPrice[name],
        ratio: modelRatio[name] === undefined ? '' : modelRatio[name],
        completionRatio: completionRatio[name] === undefined ? '' : completionRatio[name]
      }));

      setModels(modelData);
    } catch (error) {
      console.error('JSON解析错误:', error);
    }
  }, [props.options]);

  // 首先声明分页相关的工具函数
  const getPagedData = (data, currentPage, pageSize) => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  };

  // 在 return 语句之前，先处理过滤和分页逻辑
  const filteredModels = models.filter(model =>
    searchText ? model.name.toLowerCase().includes(searchText.toLowerCase()) : true
  );

  // 然后基于过滤后的数据计算分页数据
  const pagedData = getPagedData(filteredModels, currentPage, pageSize);

  const SubmitData = async () => {
    setLoading(true);
    const output = {
      ModelPrice: {},
      ModelRatio: {},
      CompletionRatio: {}
    };
    let currentConvertModelName = '';

    try {
      // 数据转换
      models.forEach(model => {
        currentConvertModelName = model.name;
        if (model.price !== '') {
          // 如果价格不为空，则转换为浮点数，忽略倍率参数
          output.ModelPrice[model.name] = parseFloat(model.price)
        } else {
          if (model.ratio !== '') output.ModelRatio[model.name] = parseFloat(model.ratio);
          if (model.completionRatio !== '') output.CompletionRatio[model.name] = parseFloat(model.completionRatio);
        }
      });

      // 准备API请求数组
      const finalOutput = {
        ModelPrice: JSON.stringify(output.ModelPrice, null, 2),
        ModelRatio: JSON.stringify(output.ModelRatio, null, 2),
        CompletionRatio: JSON.stringify(output.CompletionRatio, null, 2)
      };

      const requestQueue = Object.entries(finalOutput).map(([key, value]) => {
        return API.put('/api/option/', {
          key,
          value
        });
      });

      // 批量处理请求
      const results = await Promise.all(requestQueue);

      // 验证结果
      if (requestQueue.length === 1) {
        if (results.includes(undefined)) return;
      } else if (requestQueue.length > 1) {
        if (results.includes(undefined)) {
          return showError('部分保存失败，请重试');
        }
      }

      // 检查每个请求的结果
      for (const res of results) {
        if (!res.data.success) {
          return showError(res.data.message);
        }
      }

      showSuccess('保存成功');
      props.refresh();

    } catch (error) {
      console.error('保存失败:', error);
      showError('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const updateModel = (name, field, value) => {
    if (isNaN(value)) {
      showError('请输入数字');
      return;
    }
    setModels(prev =>
      prev.map(model =>
        model.name === name
          ? { ...model, [field]: value }
          : model
      )
    );
  };

  const deleteModel = (name) => {
    setModels(prev => prev.filter(model => model.name !== name));
  };
  
  const addModel = (values) => {
    // 检查模型名称是否存在, 如果存在则拒绝添加
    if (models.some(model => model.name === values.name)) {
      showError('模型名称已存在');
      return;
    }
    setModels(prev => [{
      name: values.name,
      price: values.price || '',
      ratio: values.ratio || '',
      completionRatio: values.completionRatio || ''
    }, ...prev]);
    setVisible(false);
    showSuccess('添加成功');
  };


  return (
    <>
      <div className="flex flex-col space-y-4 w-full">
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => setVisible(true)} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            {t('添加模型')}
          </Button>
          <Button variant="default" onClick={SubmitData} disabled={loading} className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            {t('应用更改')}
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('搜索模型名称')}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 w-[200px]"
            />
          </div>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('模型名称')}</TableHead>
                <TableHead>{t('模型固定价格')}</TableHead>
                <TableHead>{t('模型倍率')}</TableHead>
                <TableHead>{t('补全倍率')}</TableHead>
                <TableHead>{t('操作')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedData.map((record) => (
                <TableRow key={record.name}>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>
                    <Input
                      value={record.price}
                      placeholder={t('按量计费')}
                      onChange={(e) => updateModel(record.name, 'price', e.target.value)}
                      className="max-w-[200px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={record.ratio}
                      placeholder={record.price !== '' ? t('模型倍率') : t('默认补全倍率')}
                      disabled={record.price !== ''}
                      onChange={(e) => updateModel(record.name, 'ratio', e.target.value)}
                      className="max-w-[200px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={record.completionRatio}
                      placeholder={record.price !== '' ? t('补全倍率') : t('默认补全倍率')}
                      disabled={record.price !== ''}
                      onChange={(e) => updateModel(record.name, 'completionRatio', e.target.value)}
                      className="max-w-[200px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteModel(record.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="flex items-center justify-end space-x-2 py-4 px-4">
            <div className="text-sm text-muted-foreground">
              {t('第 {{start}} - {{end}} 条，共 {{total}} 条', {
                start: ((currentPage - 1) * pageSize) + 1,
                end: Math.min(currentPage * pageSize, filteredModels.length),
                total: filteredModels.length
              })}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
              >
                {t('上一页')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page => page + 1)}
                disabled={currentPage * pageSize >= filteredModels.length}
              >
                {t('下一页')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={visible} onOpenChange={setVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('添加模型')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="model-name">{t('模型名称')}</Label>
              <Input
                id="model-name"
                placeholder="strawberry"
                onChange={(e) => setCurrentModel(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="price-mode"
                checked={currentModel?.priceMode}
                onCheckedChange={(checked) => {
                  setCurrentModel(prev => ({
                    ...prev,
                    price: '',
                    ratio: '',
                    completionRatio: '',
                    priceMode: checked
                  }));
                }}
              />
              <Label htmlFor="price-mode">
                {t('定价模式')}：{currentModel?.priceMode ? t("固定价格") : t("倍率模式")}
              </Label>
            </div>
            
            {currentModel?.priceMode ? (
              <div className="space-y-2">
                <Label htmlFor="fixed-price">{t('固定价格(每次)')}</Label>
                <Input
                  id="fixed-price"
                  placeholder={t('输入每次价格')}
                  onChange={(e) => setCurrentModel(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="model-ratio">{t('模型倍率')}</Label>
                  <Input
                    id="model-ratio"
                    placeholder={t('输入模型倍率')}
                    onChange={(e) => setCurrentModel(prev => ({ ...prev, ratio: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="completion-ratio">{t('补全倍率')}</Label>
                  <Input
                    id="completion-ratio"
                    placeholder={t('输入补全价格')}
                    onChange={(e) => setCurrentModel(prev => ({ ...prev, completionRatio: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setVisible(false)}>
              {t('取消')}
            </Button>
            <Button onClick={() => currentModel && addModel(currentModel)}>
              {t('确定')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
