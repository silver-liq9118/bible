import React from 'react';
import ReactDOM from 'react-dom/client';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { TDSMobileProvider } from '@toss/tds-mobile';
import { App } from './App';
import { isToss } from './toss';
import './style.css';

function DesignProvider({ children }: React.PropsWithChildren) {
  if (isToss()) return <TDSMobileAITProvider>{children}</TDSMobileAITProvider>;
  return <TDSMobileProvider userAgent={{ fontA11y: undefined, fontScale: 100, isAndroid: false, isIOS: false, colorPreference: 'light' }}>{children}</TDSMobileProvider>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><DesignProvider><App /></DesignProvider></React.StrictMode>,
);
