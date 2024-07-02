import connect from 'connect';
import serveStatic = require('serve-static');
var proxy = require('express-http-proxy');
const { createProxyMiddleware } = require('http-proxy-middleware');

export const StatusPlugin = () => {
    const app = connect() 
    app.use('/.well-known', serveStatic('public/.well-known') as connect.HandleFunction)
    app.use('/', proxy('https://status.remixproject.org:7777/', {
        proxyReqPathResolver: (req: any) => {
		console.log(req.url)
            return new Promise((resolve, reject) => resolve('/' + req.url));
          }
    }))
    
    return app
}
