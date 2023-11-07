import http, { ServerResponse, IncomingMessage } from "http";
import { IRoute, IRouter, Request, Response, SendOptions } from "./types";
import { parse } from "url";
export class Zavva {
  routes: IRoute[] = [];
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
    const bodyConverter = await this.handleBody(req, res);
    if (!bodyConverter.status) {
      return;
    }
    const route = this.routes.find((routes) => routes.url === url.path);
    if (route) {
      req["body"] = bodyConverter.body;
      const request: Request = req as Request;
      request.body = bodyConverter.body;
      const response: Response = res as Response;
      response.send = this.send;
      route.resolver(req as Request, res as Response);
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
}
