import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';
import { parse } from 'path';

const solcoder_url = (process.env['SOLCODER_URL'] as string) || "http://127.0.0.1:7861/ai/api/";

export const solcoder = () => {
  const app = express();
  const ips = new Map<string, number>();
  app.use(cors());
  app.use('/.well-known', express.static('public/.well-known'));

  app.get('/', async (req: Request, res: Response) => {
    console.log('making request to', solcoder_url);
    try {
      const result = await axios.get(solcoder_url);
      res.send('Welcome to solcodertest.org!' + JSON.stringify(result.data));
    } catch (error) {
      res.status(500).send('Error fetching data from solcoder');
    }
  });

  app.post('/', async (req: Request, res: Response, next: NextFunction) => {
    if (ips.get(req.ip) && (Date.now() - (ips.get(req.ip) as number)) < 10000) {
      res.setHeader('Content-Type', 'application/json');
      const remainder = 10000 - (Date.now() - (ips.get(req.ip) as number));
      res.end(JSON.stringify({ error: `rate limit exceeded, please wait ${remainder} ms` }));
      next();
      return;
    }
    ips.set(req.ip, Date.now());

    if (Array.isArray(req.body.data)) {
      const prompt = req.body.data[0];
      const task = req.body.data[1];
      const params = req.body.data.slice(2);

      try {
        console.log('solcoder', prompt)
        const result = await axios.post(solcoder_url.concat(task), {
          headers: {
            "Content-Type": "application/json",
          },
          data: [prompt, ...params],
        });

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result.data));
        next();
      } catch (error) {
        res.status(500).json({ error: 'Error processing request' });
      }
    } else {
      if (req.body.stream_result) {
        const task = req.body.endpoint;
        try {
          const response = await axios({
            url: solcoder_url.concat(task),
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "Accept": "text/event-stream",
            },
            responseType: 'stream',
            data: JSON.stringify(req.body),
          });

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Transfer-Encoding', 'chunked');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');

          response.data.on('data', (chunk: Buffer) => {
            
              try {
                  res.write(`${chunk.toString()}`);
              } catch (e) {
                console.log(e)
              }
  

          });
          response.data.on('end', () => {
              res.end();
          });
        } catch (error) {
          res.status(500).json({ error: 'Error during streaming request' });
        }
      } else {
        const task = req.body.endpoint;
        try {
          const response = await axios({
            url: solcoder_url.concat(task),
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
            },
            data: JSON.stringify(req.body),
          });

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(response.data));
          next();
        } catch (error) {
          res.status(500).json({ error: 'Error processing non-stream request' });
        }
      }
    }
  });

  return app;
};
