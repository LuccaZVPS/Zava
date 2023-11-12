import { IResolver, IRoute, IRouter } from "./types";
import { pathToRegexp } from "path-to-regexp";
export class Router implements IRouter {
  routes: IRoute[] = [];
  get(route: string, ...cb: IResolver[]) {
    cb.forEach((c) => {
      this.createRoute("get", route, c);
    });
  }
  post(route: string, ...cb: IResolver[]) {
    cb.forEach((c) => {
      this.createRoute("get", route, c);
    });
  }
  put(route: string, ...cb: IResolver[]) {
    cb.forEach((c) => {
      this.createRoute("put", route, c);
    });
  }
  patch(route: string, ...cb: IResolver[]) {
    cb.forEach((c) => {
      this.createRoute("patch", route, c);
    });
  }
  delete(route: string, ...cb: IResolver[]) {
    cb.forEach((c) => {
      this.createRoute("delete", route, c);
    });
  }
  head(route: string, ...cb: IResolver[]) {
    cb.forEach((c) => {
      this.createRoute("head", route, c);
    });
  }
  options(route: string, ...cb: IResolver[]) {
    cb.forEach((c) => {
      this.createRoute("options", route, c);
    });
  }
  private createRoute(method: string, route: string, cb: IResolver) {
    this.routes.push({
      method,
      route,
      regex: pathToRegexp(route),
      resolver: cb,
    });
  }
}
