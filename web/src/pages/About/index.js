import { API, showError } from '../../helpers';
import React, { useEffect, useState } from 'react';

import { marked } from 'marked';

const About = () => {
  const [about, setAbout] = useState('');
  const [aboutLoaded, setAboutLoaded] = useState(false);

  const displayAbout = async () => {
    setAbout(localStorage.getItem('about') || '');
    const res = await API.get('/api/about');
    const { success, message, data } = res.data;
    if (success) {
      let aboutContent = data;
      if (!data.startsWith('https://')) {
        aboutContent = marked.parse(data);
      }
      setAbout(aboutContent);
      localStorage.setItem('about', aboutContent);
    } else {
      showError(message);
      setAbout('加载关于内容失败...');
    }
    setAboutLoaded(true);
  };

  useEffect(() => {
    displayAbout().then();
  }, []);

  return (
    <>
      {aboutLoaded && about === '' ? (
        <div className="flex flex-col w-full">
          <div className="p-4 border-b">
            <h3 className="text-xl font-semibold">关于</h3>
          </div>
          <div className="p-4 space-y-4">
            <p>可在设置页面设置关于内容，支持 HTML & Markdown</p>
            <p>
              New-API项目仓库地址：
              <a 
                href='https://github.com/Calcium-Ion/new-api'
                className="text-primary hover:underline ml-1"
              >
                https://github.com/Calcium-Ion/new-api
              </a>
            </p>
            <p>
              NewAPI © 2023 CalciumIon | 基于 One API v0.5.4 © 2023
              JustSong。
            </p>
            <p>
              本项目根据MIT许可证授权，需在遵守Apache-2.0协议的前提下使用。
            </p>
          </div>
        </div>
      ) : (
        <>
          {about.startsWith('https://') ? (
            <iframe
              src={about}
              className="w-full h-screen border-none"
            />
          ) : (
            <div
              className="text-lg"
              dangerouslySetInnerHTML={{ __html: about }}
            ></div>
          )}
        </>
      )}
    </>
  );
};

export default About;
