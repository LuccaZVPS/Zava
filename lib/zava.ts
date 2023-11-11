import rootPath from "pkg-dir";
import http, { ServerResponse, IncomingMessage } from "http";
import mime from "mime";
import path from "path";
import { pathToRegexp } from "path-to-regexp";
import {
  ErrorHandler,
  GlobalResolver,
  IResolver,
  IRoute,
  IRouter,
  Request,
  Response,
  SendOptions,
} from "./types";
import { Buffer } from "safe-buffer";
import parser from "parseurl";
import { Router } from "./router";
import { getParams, queryParser } from "./utils";
import fs from "fs";
export class Zava extends Router {
  constructor() {
    super();
  }
  routes: IRoute[] = [];
  globalResolvers: GlobalResolver[] = [];
  private exceptionFilterFN: ErrorHandler;
  private readonly BODY_MAX_SIZE = 1024 * 1024; // 1 MB;
  addRoutes(router: IRouter) {
    this.routes = router.routes;
  }
  run(port: number) {
    const handleRequest = async (req: IncomingMessage, res: ServerResponse) =>
      this.requestHandler(req, res);
    const server = http.createServer(handleRequest);
    server.listen(port);
  }
  private async requestHandler(req: IncomingMessage, res: ServerResponse) {
    try {
      const url = parser.original(req);
      let query = {};
      req["body"] = {};
      req["query"] = {};
      req["params"] = {};
      res["send"] = this.send;
      if (url.query) {
        query = queryParser(url["query"] as string);
      }
      const bodyConverter = await this.handleBody(req, res);
      if (!bodyConverter.status) {
        return;
      }
      req["body"] = bodyConverter.body;
      req["query"] = query;
      let next = true;
      for (let i = 0; i < this.globalResolvers.length; i++) {
        if (next) {
          const resolver = this.globalResolvers[i];
          const resolvers = resolver.resolvers;
          req["pathConfig"] = resolver.route;
          if (!resolver.route) {
            next = false;
            resolvers.forEach(async (r) => {
              await r(req as Request, res as Response, () => (next = true));
            });
          } else if (resolver.regex && resolver.regex.test(url.pathname)) {
            next = false;
            resolvers.forEach(async (r) => {
              await r(req as Request, res as Response, () => (next = true));
            });
          } else if (
            !resolver.route.includes(":") &&
            url.pathname.includes(resolver.route) &&
            url.pathname[resolver.route.length] === "/"
          ) {
            next = false;
            resolvers.forEach(async (r) => {
              await r(req as Request, res as Response, () => (next = true));
            });
          }
        } else {
          break;
        }
      }
      if (!next) {
        return;
      }

      //@ts-ignore
      const route = this.routes.find(
        (r) =>
          r.regex.test(url.pathname) && r.method === req.method.toLowerCase()
      );

      if (route) {
        const params = getParams(url.pathname, route.route);
        req["params"] = params;
        res["send"] = this.send;
        try {
          req["pathConfig"] = route.route;
          await this.resolverHandler(req as Request, res as Response, route);
        } catch (e) {
          if (this.exceptionFilterFN) {
            await this.exceptionFilterFN(req as Request, res as Response, e);
          } else {
            throw e;
          }
        }
      } else {
        res.writeHead(404);
        res.end();
      }
    } catch (e) {
      console.log(e);
    }
  }

  private handleBody(
    req: IncomingMessage,
    res
  ): Promise<{ body: any; status: boolean }> {
    return new Promise((resolve) => {
      let body = Buffer.from("");

      req.on("data", (chunk) => {
        if (Buffer.length + chunk.length > this.BODY_MAX_SIZE) {
          resolve({ body: "", status: false });
          res.writeHead(413);
          res.end("Body too large");
          req.destroy();
        } else {
          body = Buffer.concat([body, chunk]);
        }
      });

      req.on("end", () => {
        try {
          if (body.length > 0) {
            body = JSON.parse(body.toString("utf-8"));
          } else {
            body = {} as Buffer;
          }
          resolve({ body, status: true });
        } catch {
          res.writeHead(400);
          res.end("Invalid body provided");
          resolve({ body: "", status: false });
        }
      });
    });
  }

  private send(status: number, data: SendOptions) {
    if (typeof data === "string") {
      this["writeHead"](status);
      this["end"](data);
    } else {
      this["setHeader"]("Content-Type", "application/json");
      this["writeHead"](status);
      this["end"](JSON.stringify(data));
    }
  }
  public addExceptionFilter(errorHandler: ErrorHandler) {
    this.exceptionFilterFN = errorHandler;
  }
  private async resolverHandler(req, res, route) {
    let goNext = true;

    for (const r of route.resolvers) {
      if (goNext) {
        goNext = false;
        await r(req, res, () => {
          goNext = true;
        });
      } else {
        goNext = false;
      }
    }
  }
  apply(route: string | IResolver, ...args: IResolver[]) {
    if (typeof route === "string") {
      if (route === "/") {
        this.globalResolvers.push({
          resolvers: [...args],
        });
        return;
      }
      this.globalResolvers.push({
        route: route,
        regex: pathToRegexp(route),
        resolvers: [...args],
      });
    } else {
      this.globalResolvers.push({
        resolvers: [route, ...args],
      });
    }
  }
  static(folderName: string): IResolver {
    const folderPath = rootPath.sync() + "/" + folderName;

    return (req, res) => {
      if (req.method !== "GET") {
        res.writeHead(405);
        return;
      }
      const url = parser(req);
      const filePath = path.join(
        folderPath,
        url.pathname.replace(req.pathConfig, "")
      );

      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          res.writeHead(404);
          res.end("Not Found");
        } else {
          const fileStream = fs.createReadStream(filePath);

          res.writeHead(200, {
            "Content-Type": mime.lookup(filePath) || "application/octet-stream",
            "Content-Disposition": "inline",
          });

          fileStream.pipe(res);

          fileStream.on("error", (error) => {
            console.error(error);
            res.writeHead(500);
            res.end("Internal Server Error");
          });
        }
      });
    };
  }
}
