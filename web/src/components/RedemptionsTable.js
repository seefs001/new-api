import {
  API,
  copy,
  showError,
  showSuccess,
  timestamp2string,
} from '../helpers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from './ui/alert-dialog';
import {
  AlertTriangle,
  Check,
  Copy,
  Edit,
  Eye,
  Trash2,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from './ui/popover';
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import EditRedemption from '../pages/Redemption/EditRedemption';
import { ITEMS_PER_PAGE } from '../constants';
import { Separator } from './ui/separator';
import { renderQuota } from '../helpers/render';
import { useTranslation } from 'react-i18next';

function renderTimestamp(timestamp) {
  return <>{timestamp2string(timestamp)}</>;
}

const RedemptionsTable = () => {
  const { t } = useTranslation();

  const renderStatus = (status) => {
    switch (status) {
      case 1:
        return (
          <Badge variant="outline" className="text-green-500 border-green-500">
            {t('未使用')}
          </Badge>
        );
      case 2:
        return (
          <Badge variant="outline" className="text-red-500 border-red-500">
            {t('已禁用')}
          </Badge>
        );
      case 3:
        return (
          <Badge variant="outline" className="text-gray-500 border-gray-500">
            {t('已使用')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-black border-black">
            {t('未知状态')}
          </Badge>
        );
    }
  };

  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [tokenCount, setTokenCount] = useState(ITEMS_PER_PAGE);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const [editingRedemption, setEditingRedemption] = useState({
    id: undefined,
  });
  const [showEdit, setShowEdit] = useState(false);
  const [keyToView, setKeyToView] = useState(null);
  const [showKeyDialog, setShowKeyDialog] = useState(false);

  const closeEdit = () => {
    setShowEdit(false);
  };

  const setRedemptionFormat = (redeptions) => {
    setRedemptions(redeptions);
  };

  const loadRedemptions = async (startIdx, pageSize) => {
    const res = await API.get(`/api/redemption/?p=${startIdx}&page_size=${pageSize}`);
    const { success, message, data } = res.data;
    if (success) {
        const newPageData = data.items;
        setActivePage(data.page);
        setTokenCount(data.total);
        setRedemptionFormat(newPageData);
    } else {
        showError(message);
    }
    setLoading(false);
  };

  const removeRecord = (key) => {
    let newDataSource = [...redemptions];
    if (key != null) {
      let idx = newDataSource.findIndex((data) => data.key === key);

      if (idx > -1) {
        newDataSource.splice(idx, 1);
        setRedemptions(newDataSource);
      }
    }
  };

  const copyText = async (text) => {
    if (await copy(text)) {
      showSuccess(t('已复制到剪贴板！'));
    } else {
      setKeyToView(text);
      setShowKeyDialog(true);
    }
  };

  const manageRedemption = async (id, action, record) => {
    let url;
    let method;
    let body = {};
    
    switch (action) {
      case 'delete':
        url = `/api/redemption/${id}`;
        method = 'DELETE';
        break;
      case 'disable':
        url = `/api/redemption/${id}/status`;
        method = 'PUT';
        body = { status: 2 };
        break;
      case 'enable':
        url = `/api/redemption/${id}/status`;
        method = 'PUT';
        body = { status: 1 };
        break;
      default:
        showError(t('未知操作'));
        return;
    }
    
    try {
      const res = await API.request({
        url,
        method,
        data: body
      });
      
      const { success, message, data } = res.data;
      if (success) {
        showSuccess(t('操作成功！'));
        if (action === 'delete') {
          // Item will be removed through callback in the component
        } else {
          // Update the status in the current list
          setRedemptions(redemptions.map(item => 
            item.id === id ? { ...item, status: action === 'enable' ? 1 : 2 } : item
          ));
        }
      } else {
        showError(message);
      }
    } catch (error) {
      showError(t('操作失败：') + error.message);
    }
  };

  const onPaginationChange = (page) => {
    (async () => {
      if (page === Math.ceil(redemptions.length / pageSize) + 1) {
        await loadRedemptions(page - 1, pageSize);
      }
      setActivePage(page);
    })();
  };

  useEffect(() => {
    loadRedemptions(0, pageSize)
      .then()
      .catch((reason) => {
        showError(reason);
      });
  }, []);

  const refresh = async () => {
    await loadRedemptions(activePage - 1, pageSize);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('ID')}</TableHead>
            <TableHead>{t('名称')}</TableHead>
            <TableHead>{t('状态')}</TableHead>
            <TableHead>{t('额度')}</TableHead>
            <TableHead>{t('创建时间')}</TableHead>
            <TableHead>{t('兑换人ID')}</TableHead>
            <TableHead>{t('操作')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {redemptions.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.id}</TableCell>
              <TableCell>{record.name}</TableCell>
              <TableCell>{renderStatus(record.status)}</TableCell>
              <TableCell>{renderQuota(parseInt(record.quota))}</TableCell>
              <TableCell>{renderTimestamp(record.created_time)}</TableCell>
              <TableCell>{record.used_user_id === 0 ? t('无') : record.used_user_id}</TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" /> {t('查看')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-4 w-auto">
                      <pre className="text-xs bg-muted p-2 rounded">{record.key}</pre>
                    </PopoverContent>
                  </Popover>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyText(record.key)}
                  >
                    <Copy className="h-4 w-4 mr-1" /> {t('复制')}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" /> {t('删除')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('确定是否要删除此兑换码？')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('此修改将不可逆')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('取消')}</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => {
                            manageRedemption(record.id, 'delete', record).then(() => {
                              removeRecord(record.key);
                            });
                          }}
                        >
                          {t('确认删除')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  {record.status === 1 ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-yellow-500 border-yellow-500"
                      onClick={() => manageRedemption(record.id, 'disable', record)}
                    >
                      <X className="h-4 w-4 mr-1" /> {t('禁用')}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-green-500 border-green-500"
                      onClick={() => manageRedemption(record.id, 'enable', record)}
                      disabled={record.status === 3}
                    >
                      <Check className="h-4 w-4 mr-1" /> {t('启用')}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingRedemption(record);
                      setShowEdit(true);
                    }}
                    disabled={record.status !== 1}
                  >
                    <Edit className="h-4 w-4 mr-1" /> {t('编辑')}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {t('共 {{total}} 条记录', { total: tokenCount })}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange(Math.max(1, activePage - 1))}
            disabled={activePage === 1}
          >
            {t('上一页')}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onPaginationChange(activePage + 1)}
            disabled={activePage >= Math.ceil(tokenCount / pageSize)}
          >
            {t('下一页')}
          </Button>
        </div>
      </div>
      
      {/* View Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('无法复制到剪贴板，请手动复制')}</DialogTitle>
          </DialogHeader>
          <div className="bg-muted p-4 rounded-md">
            <code className="text-sm break-all">{keyToView}</code>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowKeyDialog(false)}>
              {t('关闭')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Redemption Dialog */}
      {showEdit && (
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('编辑兑换码')}</DialogTitle>
            </DialogHeader>
            <EditRedemption 
              redemption={editingRedemption} 
              onCancel={closeEdit} 
              onSuccess={() => {
                closeEdit();
                refresh();
              }} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RedemptionsTable;
