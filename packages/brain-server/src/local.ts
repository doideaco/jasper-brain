import http from 'node:http';
import { handler } from './handler.js';

const port = Number(process.env.PORT ?? 3000);

http
  .createServer((req, res) => {
    handler(req, res).catch((err) => {
      console.error('[brain-server] unhandled:', err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('content-type', 'application/json');
      }
      res.end(JSON.stringify({ error: 'Internal error' }));
    });
  })
  .listen(port, () => {
    console.log(`[brain-server] listening on http://localhost:${port}`);
    console.log(`[brain-server] brands root: ${process.env.BRAIN_ROOT ?? '<default>'}`);
  });
