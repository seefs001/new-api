import {
  API,
  copy,
  isAdmin,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Eye, Image, RefreshCw, Search, X } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ITEMS_PER_PAGE } from '../constants';
import { Input } from './ui/input';
import { renderQuota } from '../helpers/render';
import { useTranslation } from 'react-i18next';

const colors = [
  'amber',
  'blue',
  'cyan',
  'green',
  'grey',
  'indigo',
  'light-blue',
  'lime',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'violet',
  'yellow',
];

const MjLogsTable = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [isModalOpenurl, setIsModalOpenurl] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [logCount, setLogCount] = useState(ITEMS_PER_PAGE);
  const [logType, setLogType] = useState(0);
  const isAdminUser = isAdmin();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searching, setSearching] = useState(false);

  function renderType(type) {
    
    switch (type) {
      case 'IMAGINE':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            {t('绘图')}
          </Badge>
        );
      case 'UPSCALE':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            {t('放大')}
          </Badge>
        );
      case 'VARIATION':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            {t('变换')}
          </Badge>
        );
      case 'HIGH_VARIATION':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            {t('强变换')}
          </Badge>
        );
      case 'LOW_VARIATION':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            {t('弱变换')}
          </Badge>
        );
      case 'PAN':
        return (
          <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-100">
            {t('平移')}
          </Badge>
        );
      case 'DESCRIBE':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            {t('图生文')}
          </Badge>
        );
      case 'BLEND':
        return (
          <Badge className="bg-lime-100 text-lime-800 hover:bg-lime-100">
            {t('图混合')}
          </Badge>
        );
      case 'UPLOAD':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            上传文件
          </Badge>
        );
      case 'SHORTEN':
        return (
          <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">
            {t('缩词')}
          </Badge>
        );
      case 'REROLL':
        return (
          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
            {t('重绘')}
          </Badge>
        );
      case 'INPAINT':
        return (
          <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100">
            {t('局部重绘-提交')}
          </Badge>
        );
      case 'ZOOM':
        return (
          <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">
            {t('变焦')}
          </Badge>
        );
      case 'CUSTOM_ZOOM':
        return (
          <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">
            {t('自定义变焦-提交')}
          </Badge>
        );
      case 'MODAL':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            {t('窗口处理')}
          </Badge>
        );
      case 'SWAP_FACE':
        return (
          <Badge className="bg-light-green-100 text-light-green-800 hover:bg-light-green-100">
            {t('换脸')}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {t('未知')}
          </Badge>
        );
    }
  }
  
  function renderCode(code) {
    
    switch (code) {
      case 1:
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            {t('已提交')}
          </Badge>
        );
      case 21:
        return (
          <Badge className="bg-lime-100 text-lime-800 hover:bg-lime-100">
            {t('等待中')}
          </Badge>
        );
      case 22:
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            {t('重复提交')}
          </Badge>
        );
      case 0:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            {t('未提交')}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {t('未知')}
          </Badge>
        );
    }
  }
  
  function renderStatus(type) {
    
    switch (type) {
      case 'SUCCESS':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            {t('成功')}
          </Badge>
        );
      case 'NOT_START':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {t('未启动')}
          </Badge>
        );
      case 'SUBMITTED':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            {t('队列中')}
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            {t('执行中')}
          </Badge>
        );
      case 'FAILURE':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            {t('失败')}
          </Badge>
        );
      case 'MODAL':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            {t('窗口等待')}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {t('未知')}
          </Badge>
        );
    }
  }
  
  const renderTimestamp = (timestampInSeconds) => {
    const date = new Date(timestampInSeconds * 1000); // 从秒转换为毫秒
  
    const year = date.getFullYear(); // 获取年份
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // 获取月份，从0开始需要+1，并保证两位数
    const day = ('0' + date.getDate()).slice(-2); // 获取日期，并保证两位数
    const hours = ('0' + date.getHours()).slice(-2); // 获取小时，并保证两位数
    const minutes = ('0' + date.getMinutes()).slice(-2); // 获取分钟，并保证两位数
    const seconds = ('0' + date.getSeconds()).slice(-2); // 获取秒钟，并保证两位数
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // 格式化输出
  };
  // 修改renderDuration函数以包含颜色逻辑
  function renderDuration(submit_time, finishTime) {
    
    if (!submit_time || !finishTime) return 'N/A';

    const start = new Date(submit_time);
    const finish = new Date(finishTime);
    const durationMs = finish - start;
    const durationSec = (durationMs / 1000).toFixed(1);
    const color = durationSec > 60 ? 'red' : 'green';

    return (
      <Badge className={`bg-${color}-100 text-${color}-800 hover:bg-${color}-100`}>
        {durationSec} {t('秒')}
      </Badge>
    );
  }
  const columns = [
    {
      title: t('提交时间'),
      dataIndex: 'submit_time',
      render: (text, record, index) => {
        return <div>{renderTimestamp(text / 1000)}</div>;
      },
    },
    {
      title: t('花费时间'),
      dataIndex: 'finish_time', // 以finish_time作为dataIndex
      key: 'finish_time',
      render: (finish, record) => {
        // 假设record.start_time是存在的，并且finish是完成时间的时间戳
        return renderDuration(record.submit_time, finish);
      },
    },
    {
      title: t('渠道'),
      dataIndex: 'channel_id',
      className: isAdmin() ? 'tableShow' : 'tableHiddle',
      render: (text, record, index) => {
        return (
          <div>
            <Badge
              className={`bg-${colors[parseInt(text) % colors.length]} text-${colors[parseInt(text) % colors.length]} hover:bg-${colors[parseInt(text) % colors.length]}`}
              onClick={() => {
                copyText(text); // 假设copyText是用于文本复制的函数
              }}
            >
              {' '}
              {text}{' '}
            </Badge>
          </div>
        );
      },
    },
    {
      title: t('类型'),
      dataIndex: 'action',
      render: (text, record, index) => {
        return <div>{renderType(text)}</div>;
      },
    },
    {
      title: t('任务ID'),
      dataIndex: 'mj_id',
      render: (text, record, index) => {
        return <div>{text}</div>;
      },
    },
    {
      title: t('提交结果'),
      dataIndex: 'code',
      className: isAdmin() ? 'tableShow' : 'tableHiddle',
      render: (text, record, index) => {
        return <div>{renderCode(text)}</div>;
      },
    },
    {
      title: t('任务状态'),
      dataIndex: 'status',
      className: isAdmin() ? 'tableShow' : 'tableHiddle',
      render: (text, record, index) => {
        return <div>{renderStatus(text)}</div>;
      },
    },
    {
      title: t('进度'),
      dataIndex: 'progress',
      render: (text, record, index) => {
        return (
          <div>
            {
              // 转换例如100%为数字100，如果text未定义，返回0
              <Badge
                className={
                  record.status === 'FAILURE'
                    ? 'bg-warning'
                    : null
                }
                value={text ? parseInt(text.replace('%', '')) : 0}
              />
            }
          </div>
        );
      },
    },
    {
      title: t('结果图片'),
      dataIndex: 'image_url',
      render: (text, record, index) => {
        if (!text) {
          return t('无');
        }
        return (
          <Button
            onClick={() => {
              setModalImageUrl(text); // 更新图片URL状态
              setIsModalOpenurl(true); // 打开模态框
            }}
          >
            {t('查看图片')}
          </Button>
        );
      },
    },
    {
      title: 'Prompt',
      dataIndex: 'prompt',
      render: (text, record, index) => {
        // 如果text未定义，返回替代文本，例如空字符串''或其他
        if (!text) {
          return t('无');
        }

        return (
          <div className="max-w-md truncate">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs font-normal"
                    onClick={() => {
                      setModalContent(text);
                      setIsModalOpen(true);
                    }}
                  >
                    {text.slice(0, 50) + (text.length > 50 ? '...' : '')}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('查看完整关键词')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
    {
      title: 'PromptEn',
      dataIndex: 'prompt_en',
      render: (text, record, index) => {
        // 如果text未定义，返回替代文本，例如空字符串''或其他
        if (!text) {
          return t('无');
        }

        return (
          <div className="max-w-md truncate">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs font-normal"
                    onClick={() => {
                      setModalContent(text);
                      setIsModalOpen(true);
                    }}
                  >
                    {text.slice(0, 50) + (text.length > 50 ? '...' : '')}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('查看完整关键词')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
    {
      title: t('失败原因'),
      dataIndex: 'fail_reason',
      render: (text, record, index) => {
        // 如果text未定义，返回替代文本，例如空字符串''或其他
        if (!text) {
          return t('无');
        }

        return (
          <div className="max-w-md truncate">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs font-normal"
                    onClick={() => {
                      setModalContent(text);
                      setIsModalOpen(true);
                    }}
                  >
                    {text.slice(0, 50) + (text.length > 50 ? '...' : '')}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('查看失败原因')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  const [modalImageOpen, setModalImageOpen] = useState(false);
  const [modalTextOpen, setModalTextOpen] = useState(false);

  const showPrompt = async (taskId, prompt) => {
    setModalContent(prompt);
    setModalTextOpen(true);
  };

  const showImage = async (id) => {
    setModalImageUrl(id);
    setModalImageOpen(true);
  };

  const copyText = async (text) => {
    if (await copy(text)) {
      showSuccess('已复制：' + text);
    } else {
      // setSearchKeyword(text);
      Modal.error({ title: '无法复制到剪贴板，请手动复制', content: text });
    }
  };

  const loadLogs = async (page) => {
    setLoading(true);
    const url = searchKeyword === '' 
      ? `/api/midjourney/task/?p=${page}` 
      : `/api/midjourney/task/?p=${page}&keyword=${searchKeyword}`;
    try {
      const res = await API.get(url);
      const { success, message, data } = res.data;
      if (success) {
        setLogs(data.data);
        setLogCount(data.total);
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
    loadLogs(page);
  };

  const refresh = async () => {
    await loadLogs(activePage);
  };

  const searchLogs = async () => {
    setSearching(true);
    setActivePage(1);
    await loadLogs(1);
    setSearching(false);
  };

  const handleKeywordChange = (value) => {
    setSearchKeyword(value);
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter') {
      searchLogs().then();
    }
  };

  useEffect(() => {
    loadLogs(1).then();
  }, []);

  useEffect(() => {
    const mjNotifyEnabled = localStorage.getItem('mj_notify_enabled');
    if (mjNotifyEnabled !== 'true') {
      setShowBanner(true);
    }
  }, []);

  return (
    <>
      <Layout>
        {isAdminUser && showBanner ? (
          <Banner
            type='info'
            description={t('当前未开启Midjourney回调，部分项目可能无法获得绘图结果，可在运营设置中开启。')}
          />
        ) : (
          <></>
        )}
        <Form layout='horizontal' style={{ marginTop: 10 }}>
          <>
            <Form.Input
              field='channel_id'
              label={t('渠道 ID')}
              style={{ width: 176 }}
              value={channel_id}
              placeholder={t('可选值')}
              name='channel_id'
              onChange={(value) => handleInputChange(value, 'channel_id')}
            />
            <Form.Input
              field='mj_id'
              label={t('任务 ID')}
              style={{ width: 176 }}
              value={mj_id}
              placeholder={t('可选值')}
              name='mj_id'
              onChange={(value) => handleInputChange(value, 'mj_id')}
            />
            <Form.DatePicker
              field='start_timestamp'
              label={t('起始时间')}
              style={{ width: 272 }}
              initValue={start_timestamp}
              value={start_timestamp}
              type='dateTime'
              name='start_timestamp'
              onChange={(value) => handleInputChange(value, 'start_timestamp')}
            />
            <Form.DatePicker
              field='end_timestamp'
              fluid
              label={t('结束时间')}
              style={{ width: 272 }}
              initValue={end_timestamp}
              value={end_timestamp}
              type='dateTime'
              name='end_timestamp'
              onChange={(value) => handleInputChange(value, 'end_timestamp')}
            />

            <Form.Section>
              <Button
                label={t('查询')}
                type='primary'
                htmlType='submit'
                className='btn-margin-right'
                onClick={refresh}
              >
                {t('查询')}
              </Button>
            </Form.Section>
          </>
        </Form>
        <Table
          style={{ marginTop: 5 }}
          columns={columns}
          dataSource={logs}
          pagination={{
            currentPage: activePage,
            pageSize: ITEMS_PER_PAGE,
            total: logCount,
            pageSizeOpts: [10, 20, 50, 100],
            onPageChange: onPageChange,
            formatPageText: (page) =>
              t('第 {{start}} - {{end}} 条，共 {{total}} 条', {
                start: page.currentStart,
                end: page.currentEnd,
                total: logCount
              }),
          }}
          loading={loading}
        />
        <Modal
          visible={isModalOpen}
          onOk={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
          closable={null}
          bodyStyle={{ height: '400px', overflow: 'auto' }} // 设置模态框内容区域样式
          width={800} // 设置模态框宽度
        >
          <p style={{ whiteSpace: 'pre-line' }}>{modalContent}</p>
        </Modal>
        <ImagePreview
          src={modalImageUrl}
          visible={isModalOpenurl}
          onVisibleChange={(visible) => setIsModalOpenurl(visible)}
        />
      </Layout>
    </>
  );
};

export default MjLogsTable;
