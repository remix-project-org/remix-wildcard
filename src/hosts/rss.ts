import connect from 'connect';
import serveStatic = require('serve-static');
import fs from 'fs'
var cors = require('cors')

export const RSS = () => {
    const app = connect()
    app.use(cors())
    app.use('/.well-known', serveStatic('public/.well-known') as connect.HandleFunction)
    app.use('/', (req: any, res: any, next: any) => {
        res.setHeader('Content-Type', 'application/rss+xml');
        const xml = fs.readFileSync('/tmp/remix-ide-rss')
        res.end(xml)
    })
    
    return app
}
