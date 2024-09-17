## Adding more domains 

1. Add routing to endpoint

You need to point ./well-known on your endpoint to public/.well-known

```
  // this handled the certbot certificate verification for the sub domains
  app.use('/.well-known', serveStatic('public/.well-known'))
```

2. Run certbot

add your domain here with an extra '-d 'newdomain.remixproject.org''

```
certbot certonly --webroot -w /opt/remix-wildcard/public/ -d "acme.remixproject.org" -d "embedly.remixproject.org" -d "vyper.remixproject.org" -d "rss.remixproject.org" -d "vyper2.remixproject.org" -d "solcoder.remixproject.org" -d "gpt-chat.remixproject.org" -d "completion.remixproject.org" -d "jqgt.remixproject.org" -d "corsproxy.remixproject.org" -d "status.remixproject.org" -d "openai-gpt.remixproject.org" -d "solidityscan.remixproject.org" -d "github.remixproject.org" -d "common-corsproxy.remixproject.org"
```



