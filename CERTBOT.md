## Adding more domains 

1. Add routing to endpoint

You need to point ./well-known on your endpoint to public/.well-known

```
  // this handled the certbot certificate verification for the sub domains
  app.use('/.well-known', serveStatic('public/.well-known'))
```

2. Run certbot

Add the domain to domains.yml
check the existing certifcates
```
./checkcertificate.bash
```

run the update
check the existing certifcates
```
./certbot.bash
```

### do manually

add your domain here with an extra '-d 'newdomain.remixproject.org''

```
certbot certonly --webroot -w /opt/remix-wildcard/public/ -d "embedly.remixproject.org" -d "vyper.remixproject.org" -d "rss.remixproject.org" -d "vyper2.remixproject.org" -d "solcoder.remixproject.org" -d "gpt-chat.remixproject.org" -d "completion.remixproject.org" -d "jqgt.remixproject.org" -d "corsproxy.remixproject.org" -d "status.remixproject.org" -d "openai-gpt.remixproject.org" -d "solidityscan.remixproject.org" -d "github.remixproject.org" -d "ghfolderpull.remixproject.org" -d "common-corsproxy.remixproject.org"
```



