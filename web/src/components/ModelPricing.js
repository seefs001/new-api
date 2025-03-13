import { API, copy, showError, showInfo, showSuccess } from '../helpers';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "./ui/alert";
import {
  AlertCircle,
  Check,
  HelpCircle,
  Image as ImageIcon,
  MoreHorizontal
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { UserContext } from '../context/User/index.js';
import { useTranslation } from 'react-i18next';

const ModelPricing = () => {
  const { t } = useTranslation();
  const [filteredValue, setFilteredValue] = useState([]);
  const compositionRef = useRef({ isComposition: false });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [isModalOpenurl, setIsModalOpenurl] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('default');

  const rowSelection = useMemo(
      () => ({
          onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys);
          },
      }),
      []
  );

  const handleChange = (e) => {
    if (compositionRef.current.isComposition) {
      return;
    }
    const value = e.target.value;
    const newFilteredValue = value ? [value] : [];
    setFilteredValue(newFilteredValue);
  };

  const handleCompositionStart = () => {
    compositionRef.current.isComposition = true;
  };

  const handleCompositionEnd = (event) => {
    compositionRef.current.isComposition = false;
    const value = event.target.value;
    const newFilteredValue = value ? [value] : [];
    setFilteredValue(newFilteredValue);
  };
  
  function renderQuotaType(type) {
    // Ensure all cases are string literals by adding quotes.
    switch (type) {
      case 1:
        return (
          <Badge variant="outline" className="text-teal-500 border-teal-500">
            {t('按次计费')}
          </Badge>
        );
      case 0:
        return (
          <Badge variant="outline" className="text-violet-500 border-violet-500">
            {t('按量计费')}
          </Badge>
        );
      default:
        return t('未知');
    }
  }
  
  function renderAvailable(available) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Check className="text-green-500 h-5 w-5" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('您的分组可以使用该模型')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const columns = [
    {
      title: t('可用性'),
      dataIndex: 'available',
      render: (text, record, index) => {
         // if record.enable_groups contains selectedGroup, then available is true
        return renderAvailable(record.enable_groups.includes(selectedGroup));
      },
      sorter: (a, b) => a.available - b.available,
    },
    {
      title: t('模型名称'),
      dataIndex: 'model_name',
      render: (text, record, index) => {
        return (
          <>
            <Badge
              variant="outline"
              className="text-green-500 border-green-500 cursor-pointer"
              onClick={() => {
                copyText(text);
              }}
            >
              {text}
            </Badge>
          </>
        );
      },
      onFilter: (value, record) =>
        record.model_name.toLowerCase().includes(value.toLowerCase()),
      filteredValue,
    },
    {
      title: t('计费类型'),
      dataIndex: 'quota_type',
      render: (text, record, index) => {
        return renderQuotaType(parseInt(text));
      },
      sorter: (a, b) => a.quota_type - b.quota_type,
    },
    {
      title: t('可用分组'),
      dataIndex: 'enable_groups',
      render: (text, record, index) => {
        
        // enable_groups is a string array
        return (
          <div className="flex flex-wrap gap-1">
            {text.map((group) => {
              if (usableGroup[group]) {
                if (group === selectedGroup) {
                  return (
                    <Badge
                      key={group}
                      className="bg-blue-500 text-white flex items-center"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      {group}
                    </Badge>
                  );
                } else {
                  return (
                    <Badge
                      key={group}
                      variant="outline"
                      className="text-blue-500 border-blue-500 cursor-pointer"
                      onClick={() => {
                        setSelectedGroup(group);
                        showInfo(t('当前查看的分组为：{{group}}，倍率为：{{ratio}}', {
                          group: group,
                          ratio: groupRatio[group]
                        }));
                      }}
                    >
                      {group}
                    </Badge>
                  );
                }
              }
            })}
          </div>
        );
      },
    },
    {
      title: () => (
        <span className="flex items-center">
          {t('倍率')}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-5 w-5 ml-1"
                  onClick={() => {
                    setModalImageUrl('/ratio.png');
                    setIsModalOpenurl(true);
                  }}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('倍率是为了方便换算不同价格的模型')}</p>
                <p>{t('点击查看倍率说明')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
      ),
      dataIndex: 'model_ratio',
      render: (text, record, index) => {
        let content = text;
        let completionRatio = parseFloat(record.completion_ratio.toFixed(3));
        content = (
          <>
            <div className="text-sm">
              <p>{t('模型倍率')}：{record.quota_type === 0 ? text : t('无')}</p>
              <p>{t('补全倍率')}：{record.quota_type === 0 ? completionRatio : t('无')}</p>
              <p>{t('分组倍率')}：{groupRatio[selectedGroup]}</p>
            </div>
          </>
        );
        return <div>{content}</div>;
      },
    },
    {
      title: t('模型价格'),
      dataIndex: 'model_price',
      render: (text, record, index) => {
        let content = text;
        if (record.quota_type === 0) {
          // 这里的 *2 是因为 1倍率=0.002刀，请勿删除
          let inputRatioPrice = record.model_ratio * 2 * groupRatio[selectedGroup];
          let completionRatioPrice =
            record.model_ratio *
            record.completion_ratio * 2 *
            groupRatio[selectedGroup];
          content = (
            <>
              <div className="text-sm">
                <p>{t('提示')} ${inputRatioPrice} / 1M tokens</p>
                <p>{t('补全')} ${completionRatioPrice} / 1M tokens</p>
              </div>
            </>
          );
        } else {
          let price = parseFloat(text) * groupRatio[selectedGroup];
          content = <div className="text-sm">${t('模型价格')}：${price}</div>;
        }
        return <div>{content}</div>;
      },
    },
  ];

  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userState, userDispatch] = useContext(UserContext);
  const [groupRatio, setGroupRatio] = useState({});
  const [usableGroup, setUsableGroup] = useState({});

  const setModelsFormat = (models, groupRatio) => {
    for (let i = 0; i < models.length; i++) {
      models[i].key = models[i].model_name;
      models[i].group_ratio = groupRatio[models[i].model_name];
    }
    // sort by quota_type
    models.sort((a, b) => {
      return a.quota_type - b.quota_type;
    });

    // sort by model_name, start with gpt is max, other use localeCompare
    models.sort((a, b) => {
      if (a.model_name.startsWith('gpt') && !b.model_name.startsWith('gpt')) {
        return -1;
      } else if (
        !a.model_name.startsWith('gpt') &&
        b.model_name.startsWith('gpt')
      ) {
        return 1;
      } else {
        return a.model_name.localeCompare(b.model_name);
      }
    });

    setModels(models);
  };

  const loadPricing = async () => {
    setLoading(true);

    let url = '';
    url = `/api/pricing`;
    const res = await API.get(url);
    const { success, message, data, group_ratio, usable_group } = res.data;
    if (success) {
      setGroupRatio(group_ratio);
      setUsableGroup(usable_group);
      setSelectedGroup(userState.user ? userState.user.group : 'default')
      setModelsFormat(data, group_ratio);
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const refresh = async () => {
    await loadPricing();
  };

  const copyText = async (text) => {
    if (await copy(text)) {
      showSuccess(t('已复制：') + text);
    } else {
      showError(t('无法复制到剪贴板'));
    }
  };

  useEffect(() => {
    refresh().then();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('模型价格')}</h2>
        <Input
          className="max-w-xs"
          placeholder={t('搜索模型')}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
        />
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('可用性')}</TableHead>
            <TableHead>{t('模型名称')}</TableHead>
            <TableHead>{t('计费类型')}</TableHead>
            <TableHead>{t('可用分组')}</TableHead>
            <TableHead className="flex items-center">
              {t('倍率')}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-5 w-5 ml-1"
                      onClick={() => {
                        setModalImageUrl('/ratio.png');
                        setIsModalOpenurl(true);
                      }}
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('倍率是为了方便换算不同价格的模型')}</p>
                    <p>{t('点击查看倍率说明')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead>{t('模型价格')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((record) => (
            <TableRow key={record.key}>
              <TableCell>
                {record.enable_groups.includes(selectedGroup) && renderAvailable(true)}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className="text-green-500 border-green-500 cursor-pointer"
                  onClick={() => copyText(record.model_name)}
                >
                  {record.model_name}
                </Badge>
              </TableCell>
              <TableCell>
                {renderQuotaType(parseInt(record.quota_type))}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {record.enable_groups.map((group) => {
                    if (usableGroup[group]) {
                      if (group === selectedGroup) {
                        return (
                          <Badge 
                            key={group}
                            className="bg-blue-500 text-white flex items-center"
                          >
                            <Check className="mr-1 h-3 w-3" />
                            {group}
                          </Badge>
                        );
                      } else {
                        return (
                          <Badge 
                            key={group}
                            variant="outline" 
                            className="text-blue-500 border-blue-500 cursor-pointer"
                            onClick={() => {
                              setSelectedGroup(group);
                              showInfo(t('当前查看的分组为：{{group}}，倍率为：{{ratio}}', {
                                group: group,
                                ratio: groupRatio[group]
                              }));
                            }}
                          >
                            {group}
                          </Badge>
                        );
                      }
                    }
                    return null;
                  })}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p>{t('模型倍率')}：{record.quota_type === 0 ? record.model_ratio : t('无')}</p>
                  <p>{t('补全倍率')}：{record.quota_type === 0 ? parseFloat(record.completion_ratio.toFixed(3)) : t('无')}</p>
                  <p>{t('分组倍率')}：{groupRatio[selectedGroup]}</p>
                </div>
              </TableCell>
              <TableCell>
                {record.quota_type === 0 ? (
                  <div className="text-sm">
                    <p>
                      {t('提示')} ${record.model_ratio * 2 * groupRatio[selectedGroup]} / 1M tokens
                    </p>
                    <p>
                      {t('补全')} ${record.model_ratio * record.completion_ratio * 2 * groupRatio[selectedGroup]} / 1M tokens
                    </p>
                  </div>
                ) : (
                  <div className="text-sm">
                    <p>
                      {t('每次')} ${record.fixed_price * groupRatio[selectedGroup]}
                    </p>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Dialog open={isModalOpenurl} onOpenChange={setIsModalOpenurl}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('倍率说明')}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img src={modalImageUrl} alt="Ratio explanation" className="max-w-full h-auto" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelPricing;
