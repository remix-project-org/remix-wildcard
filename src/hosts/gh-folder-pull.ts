import express from 'express';
import cors from 'cors'
import axios from 'axios'

const apiToken = process.env['GH_TOKEN']

export const ghfolderpull = () => {
  const app = express()
  app.use(cors())
  console.log('set ghfolder')
  app.use('/', async (req: any, res: any, next: any) => {
    const url = new URL(req.query.ghfolder);
    console.log('get ghfolder', req.query, apiToken, process.env)
    const pathname = url.pathname;
    const pathParts = pathname.split('/');
    const username = pathParts[1];
    const repo = pathParts[2];
    const folderPath = pathParts.slice(5).join('/');
    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${folderPath}`;
    const response = await axios.get(apiUrl,
      { 
        headers: {
          Authorization: `Bearer ${apiToken}`
        } 
      });
    const data = await response.data;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
    next()
  })
  return app
}
