import express from 'express'
import axios from 'axios';
import cors from 'cors'
import path from 'path';

const apiToken = process.env['SOLIDITYSCAN_TOKEN']

export const solidityScan = () => {
    const app = express()
    app.use(cors())
    app.use('/uploadFile', async (req: any, res: any, next: any) => {


        if (!req.body || !req.body.fileName) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200);
            res.end(JSON.stringify({ error: 'fileName missing' }));
            next()
            return
        }

        if (!apiToken) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200);
            res.end(JSON.stringify({ error: 'API token missing' }));
            next()
            return
        }

        const url = `http://api.solidityscan.com/private/api-get-presigned-url?file_name=${path.basename(req.body.fileName)}`

        let errorMessage = ''
        try {
            const urlResponse = await axios(
                {
                    method: 'GET',
                    url,
                    headers: { "Authorization": `Bearer ${apiToken}` }
                }
            )

            if (urlResponse && urlResponse.data && urlResponse.data.result && urlResponse.data.result.url) {

                const fileinBinary = Buffer.from(req.body.file, 'binary') 

                const putResponse = await axios.put(urlResponse.data.result.url, fileinBinary);
                
                if (putResponse.status === 200) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(urlResponse.data));
                    next()
                    return
                }
                errorMessage = 'Error uploading file'
            } else {
                errorMessage = 'Error getting presigned url'
            }
            res.setHeader('Content-Type', 'application/json');
            res.status(200);
            res.end(JSON.stringify({ error: errorMessage }));
            next()
            return

        } catch (error) {

            res.setHeader('Content-Type', 'application/json');
            res.status(200);
            res.end(JSON.stringify({ error: error }));
            next()
            return
        }

    })

    app.use('/downloadResult', async (req: any, res: any, next: any) => {


        if (!req.body || !req.body.url) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200);
            res.end(JSON.stringify({ error: 'url missing' }));
            next()
            return
        }

        const url = req.body.url

        try {
            const urlResponse = await axios.get(url)
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(urlResponse.data));
            next()
            return

        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200);
            res.end(JSON.stringify({ error: error }));
            next()
            return
        }

    })

    return app
}

/*

USAGE:
    const fileName = 'test/testdata/Example.sol'
    const file = fs.readFileSync(fileName, 'utf-8')

    const urlResponse = await axios.post(`https://solidityscan.remixproject.org/`, {
        file,
        fileName
    });
*/