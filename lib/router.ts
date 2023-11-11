import { IResolver, IRoute, IRouter } from "./types";
import { pathToRegexp } from "path-to-regexp";
export class Router implements IRouter {
  routes: IRoute[] = [];
  get(route: string, ...cb: IResolver[]) {
    this.createRoute("get", route, cb);
  }
  post(route: string, ...cb: IResolver[]) {
    this.createRoute("post", route, cb);
  }
  put(route: string, ...cb: IResolver[]) {
    this.createRoute("put", route, cb);
  }
  patch(route: string, ...cb: IResolver[]) {
    this.createRoute("patch", route, cb);
  }
  delete(route: string, ...cb: IResolver[]) {
    this.createRoute("delete", route, cb);
  }
  head(route: string, ...cb: IResolver[]) {
    this.createRoute("head", route, cb);
  }
  options(route: string, ...cb: IResolver[]) {
    this.createRoute("options", route, cb);
  }
  private createRoute(method: string, route: string, cb: IResolver[]) {
    this.routes.push({
      method,
      route,
      regex: pathToRegexp(route),
      resolvers: cb,
    });
  }
}
