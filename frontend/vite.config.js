import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

function getSecurityHeaders({ allowInlineScripts }) {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      allowInlineScripts ? "script-src 'self' 'unsafe-inline'" : "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: ws: wss:",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
}

function addSecurityHeaders(server, headers) {
  server.middlewares.use((_req, res, next) => {
    for (const [header, value] of Object.entries(headers)) {
      res.setHeader(header, value);
    }
    next();
  });
}

function securityHeadersPlugin() {
  const devHeaders = getSecurityHeaders({ allowInlineScripts: true });
  const previewHeaders = getSecurityHeaders({ allowInlineScripts: false });

  return {
    name: 'security-headers',
    configureServer(server) {
      addSecurityHeaders(server, devHeaders);
    },
    configurePreviewServer(server) {
      addSecurityHeaders(server, previewHeaders);
    },
  };
}

export default defineConfig({
  plugins: [react(), securityHeadersPlugin()],
  server: {
    historyApiFallback: true,
  },
});
