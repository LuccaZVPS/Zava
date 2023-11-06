import { IncomingMessage, ServerResponse } from "http";
import { IRoute, IRouter } from "./types";
export class Router implements IRouter {
  routes: IRoute[] = [];
  get(route: string, cb: (req: IncomingMessage, res: ServerResponse) => void) {
    this.createRoute("get", route, cb);
  }
  post(route: string, cb: (req: IncomingMessage, res: ServerResponse) => void) {
    this.createRoute("post", route, cb);
  }
  put(route: string, cb: (req: IncomingMessage, res: ServerResponse) => void) {
    this.createRoute("put", route, cb);
  }
  patch(
    route: string,
    cb: (req: IncomingMessage, res: ServerResponse) => void
  ) {
    this.createRoute("patch", route, cb);
  }
  delete(
    route: string,
    cb: (req: IncomingMessage, res: ServerResponse) => void
  ) {
    this.createRoute("delete", route, cb);
  }
  createRoute(
    method: string,
    route: string,
    cb: (req: IncomingMessage, res: ServerResponse) => void
  ) {
    this.routes.push({ method, middlewares: [], url: route, resolver: cb });
  }
}
