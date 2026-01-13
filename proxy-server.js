const { spawn } = require('child_process');
const http = require('http');
const httpProxy = require('http-proxy');

const API_TARGET = 'http://127.0.0.1:8080';
const EXPO_PORT = 8081;
const PROXY_PORT = 5000;

const proxy = httpProxy.createProxyServer({});

proxy.on('error', (err, req, res) => {
  console.error('[Proxy Error]', err.message);
  if (res && res.writeHead) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Service unavailable', message: err.message }));
  }
});

console.log('Starting Expo on port', EXPO_PORT);
const expoProcess = spawn('npx', ['expo', 'start', '--web', '--port', String(EXPO_PORT), '--host', 'lan'], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0',
    EXPO_NO_CAPABILITY_SYNC: 'true'
  }
});

expoProcess.on('error', (err) => {
  console.error('Failed to start Expo:', err);
  process.exit(1);
});

setTimeout(() => {
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    if (req.url.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.url} -> ${API_TARGET}`);
      proxy.web(req, res, { target: API_TARGET, changeOrigin: true });
    } else {
      proxy.web(req, res, { target: `http://127.0.0.1:${EXPO_PORT}`, changeOrigin: true });
    }
  });

  server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head, { target: `http://127.0.0.1:${EXPO_PORT}`, ws: true });
  });

  server.listen(PROXY_PORT, '0.0.0.0', () => {
    console.log(`\n=================================`);
    console.log(`Proxy server running on port ${PROXY_PORT}`);
    console.log(`  /api/* -> ${API_TARGET}`);
    console.log(`  *      -> http://127.0.0.1:${EXPO_PORT}`);
    console.log(`=================================\n`);
  });
}, 8000);

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  expoProcess.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Interrupted...');
  expoProcess.kill();
  process.exit(0);
});
