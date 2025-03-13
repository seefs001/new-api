import { API, copy, isAdmin, showError, showSuccess, timestamp2string } from '../helpers';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from './ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel
} from './ui/form';
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

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ITEMS_PER_PAGE } from '../constants';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useForm } from 'react-hook-form';

const colors = {
    'amber': 'bg-amber-500 hover:bg-amber-600',
    'blue': 'bg-blue-500 hover:bg-blue-600',
    'cyan': 'bg-cyan-500 hover:bg-cyan-600',
    'green': 'bg-green-500 hover:bg-green-600',
    'grey': 'bg-gray-500 hover:bg-gray-600',
    'indigo': 'bg-indigo-500 hover:bg-indigo-600',
    'light-blue': 'bg-sky-500 hover:bg-sky-600',
    'lime': 'bg-lime-500 hover:bg-lime-600',
    'orange': 'bg-orange-500 hover:bg-orange-600',
    'pink': 'bg-pink-500 hover:bg-pink-600',
    'purple': 'bg-purple-500 hover:bg-purple-600',
    'red': 'bg-red-500 hover:bg-red-600',
    'teal': 'bg-teal-500 hover:bg-teal-600',
    'violet': 'bg-violet-500 hover:bg-violet-600',
    'yellow': 'bg-yellow-500 hover:bg-yellow-600'
};

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

function renderDuration(submit_time, finishTime) {
    // 确保startTime和finishTime都是有效的时间戳
    if (!submit_time || !finishTime) return 'N/A';

    // 将时间戳转换为Date对象
    const start = new Date(submit_time);
    const finish = new Date(finishTime);

    // 计算时间差（毫秒）
    const durationMs = finish - start;

    // 将时间差转换为秒，并保留一位小数
    const durationSec = (durationMs / 1000).toFixed(1);

    // 设置颜色：大于60秒则为红色，小于等于60秒则为绿色
    const variant = durationSec > 60 ? 'destructive' : 'success';

    // 返回带有样式的颜色标签
    return (
        <Badge variant={variant}>
            {durationSec} 秒
        </Badge>
    );
}

const LogsTable = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const isAdminUser = isAdmin();
    const form = useForm();
    
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState(1);
    const [logCount, setLogCount] = useState(ITEMS_PER_PAGE);
    const [logType] = useState(0);

    let now = new Date();
    // 初始化start_timestamp为前一天
    let zeroNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [inputs, setInputs] = useState({
        channel_id: '',
        task_id: '',
        start_timestamp: timestamp2string(zeroNow.getTime() /1000),
        end_timestamp: '',
    });
    const { channel_id, task_id, start_timestamp, end_timestamp } = inputs;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs((inputs) => ({ ...inputs, [name]: value }));
    };

    const setLogsFormat = (logs) => {
        for (let i = 0; i < logs.length; i++) {
            logs[i].timestamp2string = timestamp2string(logs[i].created_at);
            logs[i].key = '' + logs[i].id;
        }
        setLogs(logs);
        setLogCount(logs.length + ITEMS_PER_PAGE);
    }

    const loadLogs = async (startIdx) => {
        setLoading(true);

        let url = '';
        let localStartTimestamp = parseInt(Date.parse(start_timestamp) / 1000);
        let localEndTimestamp = parseInt(Date.parse(end_timestamp) / 1000 );
        if (isAdminUser) {
            url = `/api/task/?p=${startIdx}&channel_id=${channel_id}&task_id=${task_id}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}`;
        } else {
            url = `/api/task/self?p=${startIdx}&task_id=${task_id}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}`;
        }
        const res = await API.get(url);
        let { success, message, data } = res.data;
        if (success) {
            if (startIdx === 0) {
                setLogsFormat(data);
            } else {
                let newLogs = [...logs];
                newLogs.splice(startIdx * ITEMS_PER_PAGE, data.length, ...data);
                setLogsFormat(newLogs);
            }
        } else {
            showError(message);
        }
        setLoading(false);
    };

    const pageData = logs.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

    const handlePageChange = page => {
        setActivePage(page);
        if (page === Math.ceil(logs.length / ITEMS_PER_PAGE) + 1) {
            // In this case we have to load more data and then append them.
            loadLogs(page - 1).then(r => {
            });
        }
    };

    const refresh = async () => {
        // setLoading(true);
        setActivePage(1);
        await loadLogs(0);
    };

    const copyText = async (text) => {
        if (await copy(text)) {
            showSuccess('已复制：' + text);
        } else {
            // setSearchKeyword(text);
            Dialog.error({ title: "无法复制到剪贴板，请手动复制", content: text });
        }
    }

    useEffect(() => {
        refresh().then();
    }, [logType]);

    const renderType = (type) => {
        switch (type) {
            case 'MUSIC':
                return <Label basic color='grey'> 生成音乐 </Label>;
            case 'LYRICS':
                return <Label basic color='pink'> 生成歌词 </Label>;

            default:
                return <Label basic color='black'> 未知 </Label>;
        }
    }

    const renderPlatform = (type) => {
        switch (type) {
            case "suno":
                return <Label basic color='green'> Suno </Label>;
            default:
                return <Label basic color='black'> 未知 </Label>;
        }
    }

    const renderStatus = (type) => {
        switch (type) {
            case 'SUCCESS':
                return <Label basic color='green'> 成功 </Label>;
            case 'NOT_START':
                return <Label basic color='black'> 未启动 </Label>;
            case 'SUBMITTED':
                return <Label basic color='yellow'> 队列中 </Label>;
            case 'IN_PROGRESS':
                return <Label basic color='blue'> 执行中 </Label>;
            case 'FAILURE':
                return <Label basic color='red'> 失败 </Label>;
            case 'QUEUED':
                return <Label basic color='red'> 排队中 </Label>;
            case 'UNKNOWN':
                return <Label basic color='red'> 未知 </Label>;
            case '':
                return <Label basic color='black'> 正在提交 </Label>;
            default:
                return <Label basic color='black'> 未知 </Label>;
        }
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>任务日志</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="flex flex-col gap-4 md:flex-row md:items-end">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="channel_id">渠道 ID</Label>
                            <Input 
                                id="channel_id"
                                name="channel_id"
                                value={channel_id}
                                onChange={handleInputChange}
                                placeholder="请输入渠道 ID"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="task_id">任务 ID</Label>
                            <Input 
                                id="task_id"
                                name="task_id"
                                value={task_id}
                                onChange={handleInputChange}
                                placeholder="请输入任务 ID"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="start_timestamp">开始时间</Label>
                            <Input 
                                id="start_timestamp"
                                name="start_timestamp"
                                value={start_timestamp}
                                onChange={handleInputChange}
                                placeholder="请输入开始时间"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="end_timestamp">结束时间</Label>
                            <Input 
                                id="end_timestamp"
                                name="end_timestamp"
                                value={end_timestamp}
                                onChange={handleInputChange}
                                placeholder="请输入结束时间"
                            />
                        </div>
                        <Button 
                            type="button" 
                            className="md:mb-0" 
                            onClick={() => loadLogs(0)}
                        >
                            查询
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>提交时间</TableHead>
                                    <TableHead>结束时间</TableHead>
                                    <TableHead>进度</TableHead>
                                    <TableHead>花费时间</TableHead>
                                    {isAdminUser && <TableHead>渠道</TableHead>}
                                    <TableHead>平台</TableHead>
                                    <TableHead>类型</TableHead>
                                    <TableHead>任务ID</TableHead>
                                    <TableHead>任务状态</TableHead>
                                    <TableHead>失败原因</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.key}>
                                        <TableCell>{log.submit_time ? renderTimestamp(log.submit_time) : "-"}</TableCell>
                                        <TableCell>{log.finish_time ? renderTimestamp(log.finish_time) : "-"}</TableCell>
                                        <TableCell>
                                            {isNaN(log.progress?.replace('%', '')) ? 
                                                log.progress : 
                                                <div className="relative h-10 w-10">
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-xs font-medium">
                                                            {Number(log.progress?.replace('%', '') || 0)}%
                                                        </span>
                                                    </div>
                                                    <svg className="h-10 w-10" viewBox="0 0 36 36">
                                                        <circle 
                                                            cx="18" 
                                                            cy="18" 
                                                            r="16" 
                                                            fill="none" 
                                                            className="stroke-muted-foreground/20" 
                                                            strokeWidth="2" 
                                                        />
                                                        <circle 
                                                            cx="18" 
                                                            cy="18" 
                                                            r="16" 
                                                            fill="none" 
                                                            className="stroke-primary" 
                                                            strokeWidth="2" 
                                                            strokeDasharray="100" 
                                                            strokeDashoffset={100 - Number(log.progress?.replace('%', '') || 0)}
                                                            transform="rotate(-90 18 18)"
                                                        />
                                                    </svg>
                                                </div>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {log.finish_time ? renderDuration(log.submit_time, log.finish_time) : "-"}
                                        </TableCell>
                                        {isAdminUser && (
                                            <TableCell>
                                                <Badge 
                                                    variant="outline"
                                                    className={colors[Object.keys(colors)[parseInt(log.channel_id) % Object.keys(colors).length]]}
                                                    onClick={() => copy(log.channel_id)}
                                                >
                                                    {log.channel_id}
                                                </Badge>
                                            </TableCell>
                                        )}
                                        <TableCell>{renderPlatform(log.platform)}</TableCell>
                                        <TableCell>{renderType(log.action)}</TableCell>
                                        <TableCell>
                                            <span 
                                                className="cursor-pointer hover:underline" 
                                                onClick={() => {
                                                    setModalContent(JSON.stringify(log, null, 2));
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                {log.task_id}
                                            </span>
                                        </TableCell>
                                        <TableCell>{renderStatus(log.status)}</TableCell>
                                        <TableCell>
                                            {!log.fail_reason ? '无' : (
                                                <span 
                                                    className="cursor-pointer max-w-[100px] truncate hover:underline" 
                                                    onClick={() => {
                                                        setModalContent(log.fail_reason);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    {log.fail_reason}
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {logs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={isAdminUser ? 10 : 9} className="text-center py-4">
                                            {loading ? "加载中..." : "暂无数据"}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    
                    {/* Pagination could be added here using shadcn pagination component */}
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>详细信息</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[50vh] overflow-auto">
                        <pre className="bg-muted p-4 rounded-md whitespace-pre-wrap break-words font-mono text-sm">
                            {modalContent}
                        </pre>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsModalOpen(false)}>关闭</Button>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                copy(modalContent);
                                showSuccess('已复制到剪贴板');
                            }}
                        >
                            复制
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LogsTable;
