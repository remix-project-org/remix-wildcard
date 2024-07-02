import connect from 'connect';
import serveStatic = require('serve-static');
const { createProxyMiddleware } = require('http-proxy-middleware');

export const corsProxy = () => {
    const app = connect()
    app.use('/.well-known', serveStatic('public/.well-known') as connect.HandleFunction)
    app.use('/', createProxyMiddleware({ target: 'http://localhost:9999/', changeOrigin: true }));
    return app
}