import rootPath from "pkg-dir";
import http, { ServerResponse, IncomingMessage } from "http";
import { pathToRegexp } from "path-to-regexp";
import fs from "fs";
import mime from "mime";
import path from "path";
import {
  ErrorHandler,
  IResolver,
  IRoute,
  IRouter,
  Request,
  Response,
  SendOptions,
} from "./types";
import parser from "parseurl";
import { Router } from "./router";
import { paramParser, queryParser } from "./utils";
import { bodyParser } from "./middlewares/body-parser";
export class Zava extends Router {
  constructor() {
    super();
    this.apply(bodyParser());
  }
  routes: IRoute[] = [];
  private exceptionFilterFN: ErrorHandler;
  addRoutes(router: IRouter) {
    this.routes = router.routes;
  }
  run(port: number, cb?: () => any) {
    const handleRequest = async (req: IncomingMessage, res: ServerResponse) =>
      this.requestHandler(req, res);
    const server = http.createServer(handleRequest);
    server.listen(port);
    if (cb) {
      cb();
    }
  }

  private async requestHandler(req: IncomingMessage, res: ServerResponse) {
    try {
      const url = parser.original(req);
      this.addRequestProperties(req, res);
      let query = {};
      if (url.query) {
        query = queryParser(url["query"] as string);
      }
      req["query"] = query;
      await this.handleResolvers(req as Request, res as Response, url);
    } catch (e) {
      if (this.exceptionFilterFN) {
        this.exceptionFilterFN(req as Request, res as Response, e);
      }
    }
  }
  private send(status: number, data: SendOptions) {
    this["ended"] = true;
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
  private async handleResolvers(req: Request, res: Response, url) {
    let next = true;

    for (let i = 0; i < this.routes.length; i++) {
      if (next && !res["ended"]) {
        const resolver = this.routes[i];
        req["pathConfig"] = resolver.route;
        if (
          resolver.regex &&
          resolver.regex.test(url.pathname) &&
          req.method.toLowerCase() === resolver.method
        ) {
          next = false;
          req.params = paramParser(resolver.route, url.pathname);
          await resolver.resolver(
            req as Request,
            res as Response,
            () => (next = true)
          );
        }
        if (!resolver.route) {
          next = false;

          await resolver.resolver(
            req as Request,
            res as Response,
            () => (next = true)
          );
        } else if (
          resolver.regex &&
          resolver.regex.test(url.pathname) &&
          !resolver.method
        ) {
          next = false;
          await resolver.resolver(
            req as Request,
            res as Response,
            () => (next = true)
          );
        } else if (
          !resolver.route.includes(":") &&
          url.pathname.includes(resolver.route) &&
          url.pathname[resolver.route.length] === "/" &&
          !resolver.method
        ) {
          next = false;
          await resolver.resolver(
            req as Request,
            res as Response,
            () => (next = true)
          );
        }
      } else {
        break;
      }
    }
    if (!res["ended"]) {
      res.send(404);
      return;
    }
  }

  apply(route: string | IResolver | IRouter, ...args: IResolver[] | Router[]) {
    if (route instanceof Router) {
      this.routes.push(...route.routes);
      return;
    }
    if (
      typeof route !== "function" &&
      "routes" in args[0] &&
      typeof route === "string"
    ) {
      args.forEach((a) => {
        a["routes"].forEach((r) => {
          let newRoute = route + r["route"];
          if (newRoute.endsWith("/") && newRoute.length > 1) {
            newRoute = newRoute.slice(0, -1);
          }
          if (newRoute === "//") {
            newRoute = "/";
          }
          r["route"] = newRoute;
          r["regex"] = pathToRegexp(newRoute);
          this.routes.push(r);
        });
      });

      return;
    }
    if (typeof route === "string") {
      if (route === "/") {
        args.forEach((a) => {
          this.routes.push({
            resolver: a,
          });
        });
        return;
      }
      args.forEach((a) => {
        this.routes.push({
          route: route,
          regex: pathToRegexp(route),
          resolver: a,
        });
      });
      return;
    }
    this.routes.push({
      resolver: route as IResolver,
    });
    args.forEach((a) => {
      this.routes.push({
        resolver: a,
      });
    });
  }

  public static Static(folderName: string): IResolver {
    const folderPath = rootPath.sync() + "/" + folderName;
    return (req, res) => {
      res["ended"] = true;
      if (req.method !== "GET") {
        res.send(405);
        return;
      }
      const url = parser(req);
      if (!url.pathname.includes(".")) {
        res.send(404);
        return;
      }

      const filePath = path.join(
        folderPath,
        url.pathname.replace(req.pathConfig, "")
      );

      res["ended"] = true;
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
            console.log(error);
            res.writeHead(500);
            res.end("Internal Server Error");
          });
        }
      });
    };
  }

  private sendFile(status: number, filePath: string) {
    const fileStream = fs.createReadStream(filePath);
    this["writeHead"](status, {
      "Content-Type": mime.lookup(filePath) || "application/octet-stream",
      "Content-Disposition": "inline",
    });

    //@ts-ignore
    fileStream.pipe(this);

    fileStream.on("error", (error) => {
      console.log(error);
      this["writeHead"](500);
      this["end"]("Internal Server Error");
    });

    this["ended"] = true;
  }
  private readonly addRequestProperties = (
    req: IncomingMessage,
    res: ServerResponse
  ): void => {
    req["body"] = {};
    req["query"] = {};
    req["params"] = {};
    res["send"] = this.send;
    res["ended"] = false;
    res["sendFile"] = this.sendFile;
  };
}
