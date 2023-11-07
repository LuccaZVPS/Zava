import { IResolver, IRoute, IRouter } from "./types";
export class Router implements IRouter {
  routes: IRoute[] = [];
  get(route: string, cb: IResolver) {
    this.createRoute("get", route, cb);
  }
  post(route: string, cb: IResolver) {
    this.createRoute("post", route, cb);
  }
  put(route: string, cb: IResolver) {
    this.createRoute("put", route, cb);
  }
  patch(route: string, cb: IResolver) {
    this.createRoute("patch", route, cb);
  }
  delete(route: string, cb: IResolver) {
    this.createRoute("delete", route, cb);
  }
  createRoute(method: string, route: string, cb: IResolver) {
    this.routes.push({ method, middlewares: [], url: route, resolver: cb });
  }
}
