import http, { ServerResponse, IncomingMessage } from "http";
import { IRoute, IRouter } from "./types";
import { parse } from "url";
export class Zavva {
  routes: IRoute[] = [];
  addRoutes(router: IRouter) {
    this.routes = router.routes;
  }
  run(port: number) {
    const handleRequest = (req: IncomingMessage, res: ServerResponse) => {
      const url = parse(req.url || "");
      console.log(url);
      const route = this.routes.find((routes) => routes.url === url.path);
      if (route) {
        route.resolver(req, res);
      } else {
        res.writeHead(404);
      }
      res.end();
    };

    const server = http.createServer(handleRequest);

    server.listen(port);
  }
}
