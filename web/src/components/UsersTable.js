import { API, showError, showSuccess } from '../helpers';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Edit, PlusCircle, RefreshCw, Search, Trash } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip';
import { renderGroup, renderNumber, renderQuota } from '../helpers/render';

import AddUser from '../pages/User/AddUser';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import EditUser from '../pages/User/EditUser';
import { ITEMS_PER_PAGE } from '../constants';
import { Input } from './ui/input';
import { useTranslation } from 'react-i18next';

const UsersTable = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userCount, setUserCount] = useState(0);

  function renderRole(role) {
    switch (role) {
      case 1:
        return <Badge variant="outline">{t('普通用户')}</Badge>;
      case 10:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            {t('管理员')}
          </Badge>
        );
      case 100:
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            {t('超级管理员')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            {t('未知身份')}
          </Badge>
        );
    }
  }

  function renderStatus(status) {
    switch (status) {
      case 1:
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">{t('已激活')}</Badge>;
      case 2:
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">{t('已封禁')}</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">{t('未知状态')}</Badge>;
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: t('用户名'),
      dataIndex: 'username',
    },
    {
      title: t('显示名称'),
      dataIndex: 'display_name',
    },
    {
      title: t('邮箱'),
      dataIndex: 'email',
    },
    {
      title: t('组'),
      dataIndex: 'group',
      render: (text, record, index) => {
        return <div className="text-sm">{renderGroup(text)}</div>;
      },
    },
    {
      title: t('角色'),
      dataIndex: 'role',
      render: (text, record, index) => {
        return renderRole(text);
      },
    },
    {
      title: t('剩余额度'),
      dataIndex: 'quota',
      render: (text, record, index) => {
        return <div className="text-sm">{renderQuota(parseInt(text))}</div>;
      },
    },
    {
      title: t('已用额度'),
      dataIndex: 'used_quota',
      render: (text, record, index) => {
        return <div className="text-sm">{renderQuota(parseInt(text))}</div>;
      },
    },
    {
      title: t('状态'),
      dataIndex: 'status',
      render: (text, record, index) => {
        return renderStatus(text);
      },
    },
    {
      title: t('操作'),
      dataIndex: 'operation',
      render: (text, record, index) => {
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => editUser(record)}
            >
              <Edit className="mr-2 h-4 w-4" />
              {t('编辑')}
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
                    {t('确认删除此用户？删除后无法恢复，请谨慎操作！')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('取消')}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteUser(record.id)}>
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

  const loadUsers = async (page) => {
    setLoading(true);
    const url = searchKeyword === '' 
      ? `/api/user/?p=${page}` 
      : `/api/user/?p=${page}&keyword=${searchKeyword}`;
    try {
      const res = await API.get(url);
      const { success, message, data } = res.data;
      if (success) {
        setUsers(data.users);
        setUserCount(data.total);
      } else {
        showError(message);
      }
      setLoading(false);
    } catch (error) {
      showError(error.message);
      setLoading(false);
    }
  };

  const onPageChange = (page) => {
    setActivePage(page);
    loadUsers(page);
  };

  const editUser = (user) => {
    setEditingUser(user);
    setShowEditDialog(true);
  };

  const deleteUser = async (id) => {
    try {
      const res = await API.delete(`/api/user/${id}/`);
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('删除成功'));
        await loadUsers(activePage);
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message);
    }
  };

  const refresh = async () => {
    await loadUsers(activePage);
  };

  const searchUsers = async () => {
    setSearching(true);
    setActivePage(1);
    await loadUsers(1);
    setSearching(false);
  };

  const handleKeywordChange = (value) => {
    setSearchKeyword(value);
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter') {
      searchUsers().then();
    }
  };

  useEffect(() => {
    loadUsers(1).then();
  }, []);

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
          <Button onClick={searchUsers} disabled={searching} className="gap-1">
            <Search className="h-4 w-4" />
            {searching ? t('搜索中...') : t('搜索')}
          </Button>
          <Button variant="outline" onClick={refresh} className="gap-1">
            <RefreshCw className="h-4 w-4" />
            {t('刷新')}
          </Button>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-1">
          <PlusCircle className="h-4 w-4" />
          {t('添加用户')}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {columns.map((column, index) => (
              <TableHead key={index}>{column.title}</TableHead>
            ))}
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user.id}>
                {columns.map((column, columnIndex) => (
                  <TableCell key={columnIndex}>
                    {column.render ? column.render(user[column.dataIndex], user, index) : user[column.dataIndex]}
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
            {Array.from({ length: Math.min(5, Math.ceil(userCount / ITEMS_PER_PAGE)) }, (_, i) => {
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
            {Math.ceil(userCount / ITEMS_PER_PAGE) > 5 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange(Math.min(Math.ceil(userCount / ITEMS_PER_PAGE), activePage + 1))}
                className={activePage >= Math.ceil(userCount / ITEMS_PER_PAGE) ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('添加用户')}</DialogTitle>
          </DialogHeader>
          <AddUser
            onSuccess={() => {
              setShowAddDialog(false);
              refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('编辑用户')}</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <EditUser
              user={editingUser}
              onSuccess={() => {
                setShowEditDialog(false);
                refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersTable;
