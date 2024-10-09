import express, { Request } from 'express';
import cors from 'cors'
import axio from 'axios'
import { parse } from 'path';


const solcoder_url = process.env['SOLCODER_URL'] as string || "http://127.0.0.1:7861/"

export const solcoder = () => {
  const app = express()
  const ips = new Map<string, number>()
  app.use(cors())
  app.use('/.well-known', express.static('public/.well-known'));

  app.get('/', async(req, res) => {
    console.log('making request to', solcoder_url)
    const result = await axio.get(solcoder_url)
    res.send('Welcome to solcodertest.org!' + JSON.stringify(result.data));
  });
  app.post('/', async (req: any, res: any, next: any) => {
    if (ips.get(req.ip) && (Date.now() - (ips.get(req.ip) as number)) < 10000) { // 1 call every 10 seconds
      res.setHeader('Content-Type', 'application/json');
      const remainer = 10000 - (Date.now() - (ips.get(req.ip) as number))
      res.end(JSON.stringify({ error: `rate limit exceeded, please wait ${remainer} ms` }));
      next()
      return
    }
    ips.set(req.ip, Date.now())

    if (Array.isArray(req.body.data)) {      
      const prompt = req.body.data[0]
      const task = req.body.data[1]
      const params = req.body.data.slice(2, req.body.data.length)
      const result = await axio.post( solcoder_url.concat(task),
          {"data":[prompt, ...params]}
      )
      const response = result.data
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(response));
      next()
    } else{
      if (req.body.stream_result){
        const task = req.body.endpoint
        const response = await axio( solcoder_url.concat(task),{
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
          },
          responseType: 'stream',
          data: JSON.stringify(req.body),
        });
        
        res.setHeader('Content-Type', 'application/json');  // Adjust as per your content
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        response.data.on('data', (chunk: Buffer) => {
            res.write(`${chunk.toString()}`);
        })
        response.data.on('end', () => {
          res.end();
      });
      }else{
        const task = req.body.endpoint
        const response = await axio( solcoder_url.concat(task),{
          method: 'POST', 
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify(req.body),
        });
        
        res.end(JSON.stringify(response.data));
        next()
      }
    }
  })
  return app
}
