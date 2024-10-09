import express from 'express';
import cors from 'cors'
import axio from 'axios'

const completion_url = process.env['COMPLETION_URL'] as string

export const solcompletion = () => {
  const app = express()
  const ips = new Map<string, number>()
  app.use(cors())
  app.use('/.well-known', express.static('public/.well-known'));
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
      res.end(JSON.stringify(response));
      next()
    } else if (typeof req.body.data === 'object') {
      const task = req.body.data.endpoint
      const result = await axio.post( completion_url.concat(task),
        {"data":req.body.data}
      )

      if (req.body.data.stream_result){
        res.end(result);
        next()
      }else{
        const response = result.data
        res.end(JSON.stringify(response));
        next()
      }
    }
  })
  return app
}
