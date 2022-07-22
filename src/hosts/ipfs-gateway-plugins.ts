import connect from 'connect';
var proxy = require('express-http-proxy');
const { createProxyMiddleware } = require('http-proxy-middleware');

export const ipfsGatewayPlugin = () => {
    const app = connect() 
    const projectId = '2A3pvVBZZTnGN2mAVnnq8gsOVRc'
    const projectSecret = 'ac36044e46b771ba4b550e7a3bb56ef6'
    const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')
    app.use('/ipfs', proxy('https://ipfs2.ethdevops.io', {
        proxyReqPathResolver: (req: any) => {
            return new Promise((resolve, reject) => resolve('/ipfs' + req.url));
          }
    }))
    // app.use('/ipfs', createProxyMiddleware({ target: 'https://remix-project.infura-ipfs.io', changeOrigin: true }));
    // app.use('/api/v0/add', createProxyMiddleware({ target: 'https://ipfs.infura.io:5001', changeOrigin: true,
   //     headers: {
    //        Authorization: auth
    //    } 
    //}));
    return app
}