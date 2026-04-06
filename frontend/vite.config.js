import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https: ws: wss:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

function addSecurityHeaders(server) {
  server.middlewares.use((_req, res, next) => {
    for (const [header, value] of Object.entries(securityHeaders)) {
      res.setHeader(header, value);
    }
    next();
  });
}

function securityHeadersPlugin() {
  return {
    name: 'security-headers',
    configureServer(server) {
      addSecurityHeaders(server);
    },
    configurePreviewServer(server) {
      addSecurityHeaders(server);
    },
  };
}

export default defineConfig({
  plugins: [react(), securityHeadersPlugin()],
  server: {
    historyApiFallback: true,
  },
});
