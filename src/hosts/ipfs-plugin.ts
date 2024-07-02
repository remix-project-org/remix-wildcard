import connect from 'connect';
import serveStatic = require('serve-static');
var proxy = require('express-http-proxy');
const { createProxyMiddleware } = require('http-proxy-middleware');

export const ipfsPlugin = () => {
    const app = connect() 
    app.use('/.well-known', serveStatic('public/.well-known') as connect.HandleFunction)
    app.use('/ipfs', proxy('https://ipfs-cluster.ethdevops.io', {
        proxyReqPathResolver: (req: any) => {
		console.log(req.url)
            return new Promise((resolve, reject) => resolve('/ipfs' + req.url));
          }
    }))
    
    return app
}
