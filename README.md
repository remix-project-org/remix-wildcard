## Remix Wildcard

### building

run yarn build

### restart

yarn restart:production

### monitor the live service

journalctl -f -u wildcard.service

### add static endpoint to a service for certbot

app.use('/.well-known', express.static('public/.well-known'));

or

pp.use('/.well-known', serveStatic('public/.well-known') as connect.HandleFunction)

### expanding certificate

certbot certonly --webroot --expand --cert-name acme.remixproject.org -w /opt/remix-wildcard/public/ -d "embedly.remixproject.org" -d "vyper.remixproject.org" -d "rss.remixproject.org" -d "vyper2.remixproject.org" -d "solcoder.remixproject.org" -d "gpt-chat.remixproject.org" -d "completion.remixproject.org" -d "jqgt.remixproject.org" -d "corsproxy.remixproject.org" -d "status.remixproject.org" -d "openai-gpt.remixproject.org" -d "solidityscan.remixproject.org" -d "github.remixproject.org" -d "ghfolderpull.remixproject.org"