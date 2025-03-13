import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Loader2, Plus, Save, Search, X, Zap } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { showError, showSuccess } from '../../../helpers';

import { API } from '../../../helpers';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useTranslation } from 'react-i18next';

export default function ModelRatioNotSetEditor(props) {
  const { t } = useTranslation();
  const [models, setModels] = useState([]);
  const [visible, setVisible] = useState(false);
  const [batchVisible, setBatchVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [enabledModels, setEnabledModels] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [batchFillType, setBatchFillType] = useState('ratio');
  const [batchFillValue, setBatchFillValue] = useState('');
  const [batchRatioValue, setBatchRatioValue] = useState('');
  const [batchCompletionRatioValue, setBatchCompletionRatioValue] = useState('');
  
  // 定义可选的每页显示条数
  const pageSizeOptions = [10, 20, 50, 100];

  const getAllEnabledModels = async () => {
    try {
      const res = await API.get('/api/channel/models_enabled');
      const { success, message, data } = res.data;
      if (success) {
        setEnabledModels(data);
      } else {
        showError(message);
      }
    } catch (error) {
      console.error(t('获取启用模型失败:'), error);
      showError(t('获取启用模型失败'));
    }
  }

  useEffect(() => {
    // 获取所有启用的模型
    getAllEnabledModels();
  }, []);

  useEffect(() => {
    fetchUnsetModels();
  }, [props.options, enabledModels]);

  const fetchUnsetModels = async () => {
    setLoading(true);
    try {
      if (!props.options.ModelRatio) {
        return;
      }
      const modelRatio = JSON.parse(props.options.ModelRatio);
      const allUnsetModels = enabledModels.filter(model => !modelRatio[model]);
      
      // 应用搜索过滤
      let filteredModels = [...allUnsetModels];
      if (searchText) {
        filteredModels = allUnsetModels.filter(
          model => model.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      
      setModels(filteredModels);
    } catch (error) {
      console.error(t('获取未设置倍率模型失败:'), error);
      showError(t('获取未设置倍率模型失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
    fetchUnsetModels();
  };

  const handleEdit = (model) => {
    setCurrentModel(model);
    setVisible(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSaveEdit = async (modelName, ratio, completionRatio) => {
    try {
      if (!props.options.ModelRatio || !props.options.CompletionRatio) {
        showError(t('模型倍率或补全倍率未设置'));
        return;
      }
      
      // Update ModelRatio
      const modelRatio = JSON.parse(props.options.ModelRatio);
      modelRatio[modelName] = parseFloat(ratio);
      
      // Update CompletionRatio
      const completionRatio = JSON.parse(props.options.CompletionRatio);
      completionRatio[modelName] = parseFloat(completionRatio);
      
      const updateRequests = [
        API.put('/api/option/', {
          key: 'ModelRatio',
          value: JSON.stringify(modelRatio),
        }),
        API.put('/api/option/', {
          key: 'CompletionRatio',
          value: JSON.stringify(completionRatio),
        })
      ];
      
      await Promise.all(updateRequests);
      
      showSuccess(t('保存成功'));
      props.refresh();
      setVisible(false);
    } catch (error) {
      console.error(t('保存失败:'), error);
      showError(t('保存失败'));
    }
  };

  const handleBatchSave = async () => {
    try {
      if (!props.options.ModelRatio || !props.options.CompletionRatio) {
        showError(t('模型倍率或补全倍率未设置'));
        return;
      }
      
      if (selectedRowKeys.length === 0) {
        showError(t('请选择至少一个模型'));
        return;
      }
      
      if (batchFillType === 'ratio' && (!batchRatioValue || !batchCompletionRatioValue)) {
        showError(t('请输入倍率和补全倍率'));
        return;
      }
      
      const modelRatio = JSON.parse(props.options.ModelRatio);
      const completionRatio = JSON.parse(props.options.CompletionRatio);
      
      // 根据选择的类型执行不同的批量填充
      if (batchFillType === 'ratio') {
        const ratio = parseFloat(batchRatioValue);
        const compRatio = parseFloat(batchCompletionRatioValue);
        
        selectedRowKeys.forEach(model => {
          modelRatio[model] = ratio;
          completionRatio[model] = compRatio;
        });
      } else if (batchFillType === 'copy') {
        if (!batchFillValue) {
          showError(t('请输入要复制的模型名称'));
          return;
        }
        
        // 检查源模型是否存在
        if (!modelRatio[batchFillValue]) {
          showError(t('要复制的模型不存在或没有设置倍率'));
          return;
        }
        
        const sourceModelRatio = modelRatio[batchFillValue];
        const sourceCompletionRatio = completionRatio[batchFillValue] || 1;
        
        selectedRowKeys.forEach(model => {
          modelRatio[model] = sourceModelRatio;
          completionRatio[model] = sourceCompletionRatio;
        });
      }
      
      const updateRequests = [
        API.put('/api/option/', {
          key: 'ModelRatio',
          value: JSON.stringify(modelRatio),
        }),
        API.put('/api/option/', {
          key: 'CompletionRatio',
          value: JSON.stringify(completionRatio),
        })
      ];
      
      await Promise.all(updateRequests);
      
      showSuccess(t('批量保存成功'));
      props.refresh();
      setBatchVisible(false);
      setSelectedRowKeys([]);
    } catch (error) {
      console.error(t('批量保存失败:'), error);
      showError(t('批量保存失败'));
    }
  };

  const paginatedModels = models.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  const totalPages = Math.ceil(models.length / pageSize);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{t('未设置倍率模型')}</span>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8 max-w-xs"
                placeholder={t('搜索模型名称')}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setBatchVisible(true)} disabled={models.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              {t('批量设置')}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Input 
                        type="checkbox" 
                        className="w-4 h-4"
                        checked={selectedRowKeys.length === paginatedModels.length && paginatedModels.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRowKeys(paginatedModels);
                          } else {
                            setSelectedRowKeys([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>{t('模型名称')}</TableHead>
                    <TableHead className="text-right">{t('操作')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedModels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        {t('没有未设置倍率的模型')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedModels.map((model) => (
                      <TableRow key={model}>
                        <TableCell>
                          <Input 
                            type="checkbox" 
                            className="w-4 h-4"
                            checked={selectedRowKeys.includes(model)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRowKeys([...selectedRowKeys, model]);
                              } else {
                                setSelectedRowKeys(selectedRowKeys.filter(key => key !== model));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>{model}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(model)}>
                            {t('设置')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {models.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2">
                  <Label>{t('每页显示')}</Label>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) => handlePageSizeChange(Number(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder={pageSize} />
                    </SelectTrigger>
                    <SelectContent>
                      {pageSizeOptions.map(size => (
                        <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    {t('共')} {models.length} {t('条')}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    {t('上一页')}
                  </Button>
                  <span className="text-sm">
                    {currentPage} / {Math.max(1, totalPages)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    {t('下一页')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* 单模型编辑对话框 */}
        <Dialog open={visible} onOpenChange={setVisible}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('设置模型倍率')}</DialogTitle>
              <DialogDescription>
                {currentModel && t('为模型 {{model}} 设置倍率', { model: currentModel })}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="modelRatio">{t('模型倍率')}</Label>
                <Input
                  id="modelRatio"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder={t('请输入模型倍率')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="completionRatio">{t('补全倍率')}</Label>
                <Input
                  id="completionRatio"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder={t('请输入补全倍率')}
                />
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t('取消')}</Button>
              </DialogClose>
              <Button 
                onClick={() => {
                  const ratioInput = document.getElementById('modelRatio');
                  const completionRatioInput = document.getElementById('completionRatio');
                  handleSaveEdit(
                    currentModel,
                    ratioInput?.value || '1',
                    completionRatioInput?.value || '1'
                  );
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                {t('保存')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* 批量设置对话框 */}
        <Dialog open={batchVisible} onOpenChange={setBatchVisible}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('批量设置模型倍率')}</DialogTitle>
              <DialogDescription>
                {t('已选择 {{count}} 个模型', { count: selectedRowKeys.length })}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <RadioGroup value={batchFillType} onValueChange={setBatchFillType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ratio" id="ratio" />
                  <Label htmlFor="ratio">{t('指定倍率')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="copy" id="copy" />
                  <Label htmlFor="copy">{t('从其他模型复制')}</Label>
                </div>
              </RadioGroup>
              
              {batchFillType === 'ratio' ? (
                <div className="space-y-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="batchRatio">{t('模型倍率')}</Label>
                    <Input
                      id="batchRatio"
                      type="number"
                      step="0.1"
                      min="0"
                      value={batchRatioValue}
                      onChange={(e) => setBatchRatioValue(e.target.value)}
                      placeholder={t('请输入模型倍率')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batchCompletionRatio">{t('补全倍率')}</Label>
                    <Input
                      id="batchCompletionRatio"
                      type="number"
                      step="0.1"
                      min="0"
                      value={batchCompletionRatioValue}
                      onChange={(e) => setBatchCompletionRatioValue(e.target.value)}
                      placeholder={t('请输入补全倍率')}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="modelToCopy">{t('要复制的模型')}</Label>
                  <Input
                    id="modelToCopy"
                    value={batchFillValue}
                    onChange={(e) => setBatchFillValue(e.target.value)}
                    placeholder={t('请输入模型名称')}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t('取消')}</Button>
              </DialogClose>
              <Button onClick={handleBatchSave}>
                <Zap className="h-4 w-4 mr-2" />
                {t('批量保存')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
