import { defineConfig } from '@apps-in-toss/web-framework/config';

// SDK 3.x: name/icon/app type are registered in the console, not this config.
export default defineConfig({
  appName: process.env.TOSS_APP_NAME || 'todays-bible',
  brand: { primaryColor: '#3182F6' },
  navigationBar: { withBackButton: true, withTitle: true, theme: 'light' },
  webView: { bounces: false, pullToRefreshEnabled: false, allowsBackForwardNavigationGestures: false },
  permissions: [],
  webBundleDir: 'dist',
});
