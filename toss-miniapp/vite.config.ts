import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import aitDevtools from '@apps-in-toss/devtools/unplugin';
export default defineConfig({
  plugins: [aitDevtools.vite(), react()],
  // Keep the TDS provider's SDK imports visible to the devtools mock transform.
  optimizeDeps: {
    exclude: ['@toss/tds-mobile-ait'],
    include: ['@emotion/react', '@toss/tds-mobile-ait > @emotion/react > hoist-non-react-statics'],
  },
  base: './',
});
