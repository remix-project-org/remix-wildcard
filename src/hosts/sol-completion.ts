import express from 'express';
import cors from 'cors'
import axio from 'axios'

const comnpletion_url = process.env['COMPLETION_URL'] as string

export const solcompletion = () => {
  const app = express()
  const ips = new Map<string, number>()
  app.use(cors())
  app.use('/.well-known', express.static('public/.well-known'));
  app.post('/', async (req: any, res: any, next: any) => {
    const prompt = req.body.data[0]
    const task = req.body.data[1]
    const params = req.body.data.slice(2, req.body.data.length)
    const result = await axio.post( comnpletion_url.concat(task),
        {"data":[prompt, ...params]}
    )

    const response = result.data
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
    next()
  })
  return app
}
