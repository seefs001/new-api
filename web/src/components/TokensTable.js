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
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { ChevronDown, Copy, Edit, MoreHorizontal, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {renderGroup, renderQuota} from '../helpers/render';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import EditToken from '../pages/Token/EditToken';
import { ITEMS_PER_PAGE } from '../constants';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { useTranslation } from 'react-i18next';

function renderTimestamp(timestamp) {
  return <>{timestamp2string(timestamp)}</>;
}

const TokensTable = () => {

  const { t } = useTranslation();

  const renderStatus = (status, model_limits_enabled = false) => {
    switch (status) {
      case 1:
        if (model_limits_enabled) {
          return (
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
              {t('已启用：限制模型')}
            </Badge>
          );
        } else {
          return (
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
              {t('已启用')}
            </Badge>
          );
        }
      case 2:
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            {t('已禁用')}
          </Badge>
        );
      case 3:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            {t('已过期')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {t('未知状态')}
          </Badge>
        );
    }
  };

  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);
  const [selectedTokenId, setSelectedTokenId] = useState(0);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const columns = [
    {
      title: t('名称'),
      dataIndex: 'name',
    },
    {
      title: t('密钥'),
      dataIndex: 'key',
      render: (text, record, index) => {
        if (record.key === undefined || record.key === null) return '无法获取密钥';
        return (
          <div className="flex items-center gap-2">
            <div className="font-mono">
              {record.key.slice(0, 3)}...{record.key.slice(-3)}
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToken(record)}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    },
    {
      title: t('创建者'),
      dataIndex: 'user_name',
      render: (text, record, index) => {
        return <div className="text-sm">{record.user_name}</div>;
      },
    },
    {
      title: t('用户组'),
      dataIndex: 'group',
      render: (text, record, index) => {
        return <div className="text-sm">{renderGroup(record.group)}</div>;
      },
    },
    {
      title: t('状态'),
      dataIndex: 'status',
      render: (text, record, index) => {
        return renderStatus(record.status, record.model_limits_enabled);
      },
    },
    {
      title: t('剩余额度'),
      dataIndex: 'remain_quota',
      render: (text, record, index) => {
        return <div className="text-sm">{renderQuota(parseInt(record.remain_quota))}</div>;
      },
    },
    {
      title: t('已用额度'),
      dataIndex: 'used_quota',
      render: (text, record, index) => {
        return <div className="text-sm">{renderQuota(parseInt(record.used_quota))}</div>;
      },
    },
    {
      title: t('创建时间'),
      dataIndex: 'created_time',
      render: (text, record, index) => {
        return renderTimestamp(record.created_time);
      },
    },
    {
      title: t('过期时间'),
      dataIndex: 'expired_time',
      render: (text, record, index) => {
        return renderTimestamp(record.expired_time);
      },
    },
    {
      title: t('操作'),
      dataIndex: 'operation',
      render: (text, record, index) => {
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="h-8" onClick={() => manageToken(record)}>
              <Edit className="mr-2 h-4 w-4" />
              {t('管理')}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="h-8">
                  <Trash className="mr-2 h-4 w-4" />
                  {t('删除')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('确认删除')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('确认删除此密钥？删除后无法恢复，请谨慎操作！')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('取消')}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteToken(record.id)}>
                    {t('删除')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const loadTokens = async (startIdx) => {
    setLoading(true);
    const url = searchKeyword === '' ? '/api/token/?p=' + startIdx : '/api/token/?p=' + startIdx + '&keyword=' + searchKeyword;
    const res = await API.get(url);
    const { success, message, data } = res.data;
    if (success) {
      setTokens(data.tokens);
      setTokenCount(data.total);
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const onPageChange = (page) => {
    setActivePage(page);
    loadTokens(page);
  };

  const manageToken = (token) => {
    setSelectedTokenId(token.id);
    setShowEditDialog(true);
  };

  const deleteToken = async (id) => {
    const res = await API.delete(`/api/token/${id}/`);
    const { success, message } = res.data;
    if (success) {
      showSuccess(t('删除成功'));
      await loadTokens(activePage);
    } else {
      showError(message);
    }
  };

  const copyToken = (token) => {
    copy(token.key);
    showSuccess(t('已复制到剪贴板'));
  };

  const searchTokens = async () => {
    setSearching(true);
    setActivePage(1);
    await loadTokens(1);
    setSearching(false);
  };

  useEffect(() => {
    loadTokens(1);
  }, []);

  const handleKeywordChange = (value) => {
    setSearchKeyword(value);
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter') {
      searchTokens().then();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder={t('搜索关键字')}
            value={searchKeyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            onKeyDown={handleKeywordKeyDown}
            className="w-64"
          />
          <Button onClick={searchTokens} disabled={searching}>
            {searching ? t('搜索中...') : t('搜索')}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {columns.map((column, index) => (
              <TableHead key={index}>{column.title}</TableHead>
            ))}
          </TableHeader>
          <TableBody>
            {tokens.map((token, index) => (
              <TableRow key={token.id}>
                {columns.map((column, columnIndex) => (
                  <TableCell key={columnIndex}>
                    {column.render ? column.render(token[column.dataIndex], token, index) : token[column.dataIndex]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(Math.max(1, activePage - 1))}
                className={activePage <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, Math.ceil(tokenCount / ITEMS_PER_PAGE)) }, (_, i) => {
              const page = i + 1;
              return (
                <PaginationItem key={page}>
                  <PaginationLink 
                    isActive={page === activePage}
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            {Math.ceil(tokenCount / ITEMS_PER_PAGE) > 5 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange(Math.min(Math.ceil(tokenCount / ITEMS_PER_PAGE), activePage + 1))}
                className={activePage >= Math.ceil(tokenCount / ITEMS_PER_PAGE) ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('管理密钥')}</DialogTitle>
          </DialogHeader>
          <EditToken
            tokenId={selectedTokenId}
            onClose={() => setShowEditDialog(false)}
            onSuccess={() => {
              setShowEditDialog(false);
              loadTokens(activePage);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TokensTable;
