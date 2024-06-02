import axios from 'axios';
import express from 'express';
import serveStatic = require('serve-static');

export const gitHub = () => {
  const app = express();
  console.log('gitHub middleware')
  // this handled the certbot certificate verification for the sub domains
  app.use('/.well-known', serveStatic('public/.well-known'))
  app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
  });
  app.use(
    '/login/device/code',
    async (req: any, res: any, next: any) => {
      const response = await axios({
        method: 'post',
        url: 'https://github.com/login/device/code',
        data: {
          client_id: '2795b4e41e7197d6ea11',
          scope: 'repo gist user:email read:user'
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
  
      const githubrespone = await response.data;
      console.log('json', githubrespone)
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(githubrespone));
      next()
    }
  );

  app.use(
    '/login/oauth/access_token',
    async (req: any, res: any, next: any) => {
      const accestokenresponse = await axios({
        method: 'post',
        url: 'https://github.com/login/oauth/access_token',
        data: {
          client_id: '2795b4e41e7197d6ea11',
          device_code: req.body.device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
  
      // convert response to json
      const response = await accestokenresponse.data;
      console.log('json', response)
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(response));
      next()
    }
  );

  return app;
};