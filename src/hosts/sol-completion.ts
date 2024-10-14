import express from 'express';
import cors from 'cors'
import axio from 'axios'

const completion_url = process.env['COMPLETION_URL'] as string || "http://127.0.0.1:7861/ai/api/"

export const solcompletion = () => {
  const app = express()
  const ips = new Map<string, number>()
  app.use(cors())
  app.use('/.well-known', express.static('public/.well-known'));
  app.get('/', (req, res) => {
    res.send('Welcome to solcodercomptest.org!');
  });
  app.post('/', async (req: any, res: any, next: any) => {
    res.setHeader('Content-Type', 'application/json');
    if (Array.isArray(req.body.data)) {      
      const prompt = req.body.data[0]
      const task = req.body.data[1]
      const params = req.body.data.slice(2, req.body.data.length)
      const result = await axio.post( completion_url.concat(task),
          {"data":[prompt, ...params]}
      )
      const response = result.data
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(response));
      next()
    } else{
      if (req.body.stream_result){
        const task = req.body.endpoint
        const response = await axio( completion_url.concat(task),{
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
        const response = await axio( completion_url.concat(task),{
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
