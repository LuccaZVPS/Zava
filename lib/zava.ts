import http, { ServerResponse, IncomingMessage } from "http";
import {
  ErrorHandler,
  IRoute,
  IRouter,
  Request,
  Response,
  SendOptions,
} from "./types";
import { parse } from "url";
import { Router } from "./router";
import { queryParser, removeCharacters } from "./utils";
export class Zava extends Router {
  constructor() {
    super();
  }
  routes: IRoute[] = [];
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
    const url = parse(req.url || "");
    let query = {};
    if (url.query) {
      query = queryParser(url.query);
    }
    const bodyConverter = await this.handleBody(req, res);
    if (!bodyConverter.status) {
      return;
    }
    const { route, params } = this.findRoute(url.pathname, req);
    if (route) {
      req["body"] = bodyConverter.body;
      req["query"] = query;
      req["params"] = params;
      res["send"] = this.send;
      try {
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
  }

  private handleBody(
    req: IncomingMessage,
    res
  ): Promise<{ body: any; status: boolean }> {
    return new Promise((resolve) => {
      let body = Buffer.from("");
      req.on("data", (chunk) => {
        if (Buffer.byteLength(body) + chunk.length > this.BODY_MAX_SIZE) {
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
          body = JSON.parse(body.toString());
          resolve({ body, status: true });
        } catch {
          res.writeHead(400);
          res.end("invalid body provided");
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
  private findRoute(url: string, req): { route: IRoute | void; params: any } {
    if (url === "/") {
      return {
        route: this.routes.find(
          (r) => r.method === req.method.toLowerCase() && r.url === "/"
        ),
        params: {},
      };
    }
    let params = {};
    let foundRoute: IRoute;
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }
    for (const route of this.routes) {
      const routeParts = route.url.split("/");
      const urlParts = url.split("/");
      routeParts.shift();
      urlParts.shift();
      if (route.method !== req.method.toLowerCase()) {
        continue;
      }
      const biggerList =
        routeParts.length > urlParts.length ? routeParts : urlParts;
      let urlExist = true;
      const tempParam = {};
      for (let index = 0; index < biggerList.length; index++) {
        const r1 = routeParts[index];
        const r2 = urlParts[index];
        if (r1?.startsWith(":")) {
          if (r1.endsWith("?")) {
            tempParam[removeCharacters(r1, ":", "?")] = r2;
            continue;
          }
          if (!r2) {
            urlExist = false;
            continue;
          }
          tempParam[removeCharacters(r1, ":", "?")] = r2;
        } else {
          if (r1 != r2) {
            urlExist = false;
            continue;
          }
        }
      }
      if (urlExist) {
        foundRoute = route;
        params = tempParam;
      }
    }
    if (foundRoute) {
      return { route: foundRoute, params };
    }
    return { route: null, params };
  }
}
