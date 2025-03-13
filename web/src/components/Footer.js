import React, { useContext, useEffect, useState } from 'react';
import { getFooterHTML, getSystemName } from '../helpers';

import { Link } from 'react-router-dom';
import { StyleContext } from '../context/Style/index.js';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

const FooterBar = () => {
  const { t } = useTranslation();
  const systemName = getSystemName();
  const [footer, setFooter] = useState(getFooterHTML());
  const [styleState] = useContext(StyleContext);
  let remainCheckTimes = 5;

  const loadFooter = () => {
    let footer_html = localStorage.getItem('footer_html');
    if (footer_html) {
      setFooter(footer_html);
    }
  };

  const defaultFooter = (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex items-center space-x-1">
        <Link to="/" className="font-medium text-primary hover:underline">
          {systemName}
        </Link>
        <span className="text-muted-foreground">
          {import.meta.env.VITE_REACT_APP_VERSION && ` v${import.meta.env.VITE_REACT_APP_VERSION}`}
        </span>
      </div>
      <div className="text-sm text-muted-foreground">
        {t('由')}{' '}
        <a
          href='https://github.com/Calcium-Ion'
          target='_blank'
          rel='noreferrer'
          className="underline underline-offset-4 hover:text-primary"
        >
          Calcium-Ion
        </a>{' '}
        {t('开发，基于')}{' '}
        <a
          href='https://github.com/songquanpeng/one-api'
          target='_blank'
          rel='noreferrer'
          className="underline underline-offset-4 hover:text-primary"
        >
          One API
        </a>
      </div>
      <div className="text-xs text-muted-foreground">
        <a
          href='https://github.com/Calcium-Ion/new-api'
          target='_blank'
          rel='noreferrer'
          className="hover:text-primary"
        >
          GitHub
        </a>
      </div>
    </div>
  );

  useEffect(() => {
    const timer = setInterval(() => {
      if (remainCheckTimes <= 0) {
        clearInterval(timer);
        return;
      }
      remainCheckTimes--;
      loadFooter();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <footer className={cn(
      "border-t py-6 md:py-0",
      styleState.showSider ? "md:px-6" : "px-4 md:px-6",
      !styleState.showSider && "mt-8"
    )}>
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        {footer ? (
          <div
            className='custom-footer w-full max-w-(--breakpoint-lg) mx-auto text-center'
            dangerouslySetInnerHTML={{ __html: footer }}
          ></div>
        ) : (
          defaultFooter
        )}
      </div>
    </footer>
  );
};

export default FooterBar;
