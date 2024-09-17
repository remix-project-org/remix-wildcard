import connect from 'connect';
import { Request, Response, NextFunction } from "express";
const { createProxyMiddleware } = require('http-proxy-middleware')
import type { ClientRequest } from "http";
import cors from "cors";

var corsWhiteList: string[] = process.env?.CORS?.split(",") ?? [];

// target source: 1. headers.proxy 2. urlQuery.proxy
const getTarget = (
    req: Request,
    onError: Function | null = () => {
      throw new Error("No proxy target provided");
    }
  ): string => {
    const target = req?.headers?.proxy ?? req?.query?.proxy ?? "";
    if (!target) onError?.();
    return `${target}`;
  };

const BLOCK_HEADER_KEYS: (string | RegExp)[] = [
    // "host",
    "proxy",
    "referer",
    "origin",
    "user-agent",
    /^sec-/,
  ];

const removeHeaders = (proxyReq: ClientRequest): void => {
    Object.keys(proxyReq.getHeaders() || {}).forEach((key) => {
      if (
        BLOCK_HEADER_KEYS.find((rule) =>
          typeof rule === "string" ? rule === key : rule.test(key)
        ) !== undefined
      ) {
        proxyReq.removeHeader(key);
      }
    });
  };

  const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction = () => {}
  ) => {
    console.error("[Error]: ", err.message);
    res.status(400).send(`Error: ${err.message}`);
  };

const RES_REMOVE_HEADERS: string[] = [
    "x-frame-options",
    "content-security-policy",
  ];

export const standardCorsProxy = () => {
    const app = connect()
    
    app.use(
        cors({
          origin: (origin = "", callback: any) => {
            if (corsWhiteList.length === 0) {
              callback(null, true);
            } else if (corsWhiteList.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error("Origin Not allowed by CORS"));
            }
          },
        })
      );

     const proxyMiddleware = createProxyMiddleware({
        changeOrigin: true,
        router: async (req: any) => getTarget(req),
        onProxyReq: (proxyReq: any, req: any, res: any) => {
          removeHeaders(proxyReq);
        },
        onProxyRes: (proxyRes: any, req: any, res: any) => {
          RES_REMOVE_HEADERS.forEach((key) => {
            delete proxyRes.headers[key];
          });
        },
        proxyTimeout: 900 * 10,
        
      });

    app.use('/', proxyMiddleware)
    return app
}

