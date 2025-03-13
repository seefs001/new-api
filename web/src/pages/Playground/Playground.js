import { API, getUserIdFromLocalStorage, showError } from '../../helpers/index.js';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Loader2, Settings } from "lucide-react";
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { renderGroupOption, truncateText } from '../../helpers/render.js';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { SSE } from 'sse';
import { Separator } from "../../components/ui/separator";
import { Slider } from "../../components/ui/slider";
import { StyleContext } from '../../context/Style/index.js';
import { Textarea } from "../../components/ui/textarea";
import { UserContext } from '../../context/User/index.js';
import { useTranslation } from 'react-i18next';

// The roleInfo object defines avatar and name for different roles in the chat
const roleInfo = {
  user: {
    name: 'User',
    avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png'
  },
  assistant: {
    name: 'Assistant',
    avatar: 'logo.png'
  },
  system: {
    name: 'System',
    avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png'
  }
}

let id = 4;
function getId() {
  return `${id++}`
}

const Playground = () => {
  const { t } = useTranslation();
  
  const defaultMessage = [
    {
      role: 'user',
      id: '2',
      createAt: 1715676751919,
      content: t('你好'),
    },
    {
      role: 'assistant',
      id: '3',
      createAt: 1715676751919,
      content: t('你好，请问有什么可以帮助您的吗？'),
    }
  ];

  const [inputs, setInputs] = useState({
    model: 'gpt-4o-mini',
    group: '',
    max_tokens: 0,
    temperature: 0,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [userState, userDispatch] = useContext(UserContext);
  const [status, setStatus] = useState({});
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant. You can help me by answering my questions. You can also ask me questions.');
  const [message, setMessage] = useState(defaultMessage);
  const [models, setModels] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showSettings, setShowSettings] = useState(true);
  const [styleState, styleDispatch] = useContext(StyleContext);

  const handleInputChange = (name, value) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  useEffect(() => {
    if (searchParams.get('expired')) {
      showError(t('未登录或登录已过期，请重新登录！'));
    }
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      setStatus(status);
    }
    loadModels();
    loadGroups();
  }, []);

  const loadModels = async () => {
    let res = await API.get(`/api/user/models`);
    const { success, message, data } = res.data;
    if (success) {
      let localModelOptions = data.map((model) => ({
        label: model,
        value: model,
      }));
      setModels(localModelOptions);
    } else {
      showError(t(message));
    }
  };

  const loadGroups = async () => {
    let res = await API.get(`/api/user/self/groups`);
    const { success, message, data } = res.data;
    if (success) {
      let localGroupOptions = Object.entries(data).map(([group, info]) => ({
        label: truncateText(info.desc, "50%"),
        value: group,
        ratio: info.ratio,
        fullLabel: info.desc // 保存完整文本用于tooltip
      }));

      if (localGroupOptions.length === 0) {
        localGroupOptions = [{
          label: t('用户分组'),
          value: '',
          ratio: 1
        }];
      } else {
        const localUser = JSON.parse(localStorage.getItem('user'));
        const userGroup = (userState.user && userState.user.group) || (localUser && localUser.group);
        
        if (userGroup) {
          const userGroupIndex = localGroupOptions.findIndex(g => g.value === userGroup);
          if (userGroupIndex > -1) {
            const userGroupOption = localGroupOptions.splice(userGroupIndex, 1)[0];
            localGroupOptions.unshift(userGroupOption);
          }
        }
      }

      setGroups(localGroupOptions);
      handleInputChange('group', localGroupOptions[0].value);
    } else {
      showError(t(message));
    }
  };

  const getSystemMessage = () => {
    if (systemPrompt !== '') {
      return {
        role: 'system',
        id: '1',
        createAt: 1715676751919,
        content: systemPrompt,
      }
    }
  }

  let handleSSE = (payload) => {
    let source = new SSE('/pg/chat/completions', {
      headers: {
        "Content-Type": "application/json",
        "New-Api-User": getUserIdFromLocalStorage(),
      },
      method: "POST",
      payload: JSON.stringify(payload),
    });
    source.addEventListener("message", (e) => {
      // 只有收到 [DONE] 时才结束
      if (e.data === "[DONE]") {
        source.close();
        completeMessage();
        return;
      }

      let payload = JSON.parse(e.data);
      // 检查是否有 delta content
      if (payload.choices?.[0]?.delta?.content) {
        generateMockResponse(payload.choices[0].delta.content);
      }
    });

    source.addEventListener("error", (e) => {
      generateMockResponse(e.data)
      completeMessage('error')
    });

    source.addEventListener("readystatechange", (e) => {
      if (e.readyState >= 2) {
        if (source.status === undefined) {
          source.close();
          completeMessage();
        }
      }
    });
    source.stream();
  }

  const onMessageSend = useCallback((content, attachment) => {
    console.log("attachment: ", attachment);
    setMessage((prevMessage) => {
      const newMessage = [
        ...prevMessage,
        {
          role: 'user',
          content: content,
          createAt: Date.now(),
          id: getId()
        }
      ];

      // 将 getPayload 移到这里
      const getPayload = () => {
        let systemMessage = getSystemMessage();
        let messages = newMessage.map((item) => {
          return {
            role: item.role,
            content: item.content,
          }
        });
        if (systemMessage) {
          messages.unshift(systemMessage);
        }
        return {
          messages: messages,
          stream: true,
          model: inputs.model,
          group: inputs.group,
          max_tokens: parseInt(inputs.max_tokens),
          temperature: inputs.temperature,
        };
      };

      // 使用更新后的消息状态调用 handleSSE
      handleSSE(getPayload());
      newMessage.push({
        role: 'assistant',
        content: '',
        createAt: Date.now(),
        id: getId(),
        status: 'loading'
      });
      return newMessage;
    });
  }, [getSystemMessage]);

  const completeMessage = useCallback((status = 'complete') => {
    // console.log("Complete Message: ", status)
    setMessage((prevMessage) => {
      const lastMessage = prevMessage[prevMessage.length - 1];
      // only change the status if the last message is not complete and not error
      if (lastMessage.status === 'complete' || lastMessage.status === 'error') {
        return prevMessage;
      }
      return [
        ...prevMessage.slice(0, -1),
        { ...lastMessage, status: status }
      ];
    });
  }, [])

  const generateMockResponse = useCallback((content) => {
    // console.log("Generate Mock Response: ", content);
    setMessage((message) => {
      const lastMessage = message[message.length - 1];
      let newMessage = {...lastMessage};
      if (lastMessage.status === 'loading' || lastMessage.status === 'incomplete') {
        newMessage = {
          ...newMessage,
          content: (lastMessage.content || '') + content,
          status: 'incomplete'
        }
      }
      return [ ...message.slice(0, -1), newMessage ]
    })
  }, []);

  const SettingsToggle = () => {
    if (!styleState.isMobile) return null;
    return (
      <Button
        variant="outline"
        size="icon"
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-r-full shadow-md"
        onClick={() => setShowSettings(!showSettings)}
      >
        <Settings className="h-4 w-4" />
      </Button>
    );
  };

  // Render a chat message
  const ChatMessage = ({ message }) => {
    const isUser = message.role === 'user';
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[80%] ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
          {message.content}
          {message.status === 'loading' && (
            <Loader2 className="inline ml-2 h-4 w-4 animate-spin" />
          )}
        </div>
      </div>
    );
  };

  // Custom input component
  const ChatInput = () => {
    const [inputValue, setInputValue] = useState('');
    
    const handleSend = () => {
      if (inputValue.trim()) {
        onMessageSend(inputValue);
        setInputValue('');
      }
    };
    
    return (
      <div className="flex items-end border rounded-lg p-2 mt-2">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t("请输入消息...")}
          className="grow min-h-[40px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button 
          onClick={handleSend}
          size="sm"
          className="ml-2"
        >
          {t("发送")}
        </Button>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {(showSettings || !styleState.isMobile) && (
        <div className={`${styleState.isMobile ? 'absolute z-10 bg-background h-full' : 'w-72'} border-r`}>
          <Card className="m-2 h-full overflow-auto">
            <CardContent className="p-4 space-y-4">
              <div>
                <div className="mb-1 font-medium">{t('分组')}：</div>
                <Select
                  value={inputs.group}
                  onValueChange={(value) => handleInputChange('group', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('请选择分组')} />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.value} value={group.value}>
                        {group.label} {group.ratio !== 1 ? `(${group.ratio}x)` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="mb-1 font-medium">{t('模型')}：</div>
                <Select
                  value={inputs.model}
                  onValueChange={(value) => handleInputChange('model', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('请选择模型')} />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="mb-1 font-medium">Temperature：</div>
                <Slider
                  value={[inputs.temperature]}
                  min={0.1}
                  max={1}
                  step={0.1}
                  onValueChange={(value) => handleInputChange('temperature', value[0])}
                />
              </div>
              
              <div>
                <div className="mb-1 font-medium">MaxTokens：</div>
                <Input
                  placeholder="MaxTokens"
                  value={inputs.max_tokens}
                  onChange={(e) => handleInputChange('max_tokens', e.target.value)}
                />
              </div>
              
              <div>
                <div className="mb-1 font-medium">System：</div>
                <Textarea
                  placeholder="System Prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="flex-1 h-full relative overflow-hidden">
        <SettingsToggle />
        
        <div className="h-full flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t('聊天')}</h2>
            <Button 
              variant="outline" 
              onClick={() => setMessage([])}
              size="sm"
            >
              {t("清空对话")}
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto border rounded-lg p-4 mb-4">
            {message.length > 0 ? (
              message.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                {t("开始一个新的对话")}
              </div>
            )}
          </div>
          
          <ChatInput />
        </div>
      </div>
    </div>
  );
};

export default Playground;
