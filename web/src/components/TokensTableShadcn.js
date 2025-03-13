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
import { renderGroup, renderQuota } from '../helpers/render';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronDown } from 'lucide-react';
import EditToken from '../pages/Token/EditToken';
import { ITEMS_PER_PAGE } from '../constants';
import { Separator } from './ui/separator';
import { useTranslation } from 'react-i18next';

function renderTimestamp(timestamp) {
  return <>{timestamp2string(timestamp)}</>;
}

const TokensTableShadcn = () => {
  const { t } = useTranslation();

  const renderStatus = (status, model_limits_enabled = false) => {
    switch (status) {
      case 1:
        if (model_limits_enabled) {
          return (
            <Badge variant="success" size="lg">
              {t('已启用：限制模型')}
            </Badge>
          );
        } else {
          return (
            <Badge variant="success" size="lg">
              {t('已启用')}
            </Badge>
          );
        }
      case 2:
        return (
          <Badge variant="warning" size="lg">
            {t('已禁用')}
          </Badge>
        );
      case 3:
        return (
          <Badge variant="destructive" size="lg">
            {t('已过期')}
          </Badge>
        );
      case 4:
        return (
          <Badge variant="secondary" size="lg">
            {t('已耗尽')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" size="lg">
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
  const [showEditTokenModal, setShowEditTokenModal] = useState(false);
  const [currentEditToken, setCurrentEditToken] = useState({});

  const loadTokens = async (startIdx) => {
    const res = await API.get(`/api/token/?p=${startIdx}`);
    const { success, message, data } = res.data;
    if (success) {
      setTokens(data.tokens);
      setTokenCount(data.count);
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const onPageChange = (page) => {
    setActivePage(page);
    loadTokens(page);
  };

  useEffect(() => {
    loadTokens(1);
  }, []);

  const manageToken = (token) => {
    setCurrentEditToken(token);
    setShowEditTokenModal(true);
  };

  const deleteToken = async (id) => {
    const res = await API.delete(`/api/token/${id}/`);
    const { success, message } = res.data;
    if (success) {
      showSuccess('令牌删除成功！');
      await loadTokens(activePage);
    } else {
      showError(message);
    }
  };

  const copyToken = (token) => {
    copy(token);
    showSuccess('令牌已复制到剪贴板！');
  };

  const searchTokens = async () => {
    if (searchKeyword === '') {
      // if keyword is blank, load files instead.
      await loadTokens(1);
      return;
    }
    setSearching(true);
    const res = await API.get(`/api/token/search?keyword=${searchKeyword}`);
    const { success, message, data } = res.data;
    if (success) {
      setTokens(data);
      setTokenCount(data.length);
      setActivePage(1);
    } else {
      showError(message);
    }
    setSearching(false);
  };

  const handleKeywordChange = (value) => {
    setSearchKeyword(value.trim());
  };

  const pageCount = Math.ceil(tokenCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={t('搜索令牌')}
            value={searchKeyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Button onClick={searchTokens} disabled={searching}>
            {searching ? t('搜索中...') : t('搜索')}
          </Button>
        </div>
        <Button onClick={() => manageToken({})}>
          {t('新建令牌')}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('名称')}</TableHead>
            <TableHead>{t('令牌')}</TableHead>
            <TableHead>{t('状态')}</TableHead>
            <TableHead>{t('已用额度')}</TableHead>
            <TableHead>{t('剩余额度')}</TableHead>
            <TableHead>{t('创建时间')}</TableHead>
            <TableHead>{t('过期时间')}</TableHead>
            <TableHead>{t('操作')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token) => (
            <TableRow key={token.id}>
              <TableCell>{token.name}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs">
                    {token.key.substring(0, 3) +
                      '...' +
                      token.key.substring(token.key.length - 3)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToken(token.key)}
                  >
                    {t('复制')}
                  </Button>
                </div>
              </TableCell>
              <TableCell>{renderStatus(token.status, token.model_limits_enabled)}</TableCell>
              <TableCell>{renderQuota(token.used_quota)}</TableCell>
              <TableCell>{renderQuota(token.remain_quota)}</TableCell>
              <TableCell>{renderTimestamp(token.created_time)}</TableCell>
              <TableCell>{renderTimestamp(token.expired_time)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => manageToken(token)}
                  >
                    {t('编辑')}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        {t('删除')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('确认删除')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('确定要删除令牌')} {token.name} {t('吗？')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('取消')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteToken(token.id)}>
                          {t('确认')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pageCount > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(Math.max(1, activePage - 1))}
                disabled={activePage === 1}
              />
            </PaginationItem>
            
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === activePage}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(pageCount, activePage + 1))}
                disabled={activePage === pageCount}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {showEditTokenModal && (
        <Dialog open={showEditTokenModal} onOpenChange={setShowEditTokenModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {currentEditToken.id ? t('编辑令牌') : t('新建令牌')}
              </DialogTitle>
            </DialogHeader>
            <EditToken
              token={currentEditToken}
              onClose={() => setShowEditTokenModal(false)}
              onSuccess={() => {
                setShowEditTokenModal(false);
                loadTokens(activePage);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TokensTableShadcn; 