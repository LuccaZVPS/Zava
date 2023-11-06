import { ServerResponse, IncomingMessage } from "http";

export interface IRoute {
  url: string;
  method: string;
  middlewares: IMiddleware[];
  resolver: IResolver;
}

export type IMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  nextFn: () => void
) => void;
export type IResolver = (req: IncomingMessage, res: ServerResponse) => void;

export interface IRouter {
  get(
    route: string,
    cb: (req: IncomingMessage, res: ServerResponse) => void
  ): void;
  post(
    route: string,
    cb: (req: IncomingMessage, res: ServerResponse) => void
  ): void;
  put(
    route: string,
    cb: (req: IncomingMessage, res: ServerResponse) => void
  ): void;
  delete(
    route: string,
    cb: (req: IncomingMessage, res: ServerResponse) => void
  ): void;
  patch(
    route: string,
    cb: (req: IncomingMessage, res: ServerResponse) => void
  ): void;
  patch(
    route: string,
    cb: (req: IncomingMessage, res: ServerResponse) => void
  ): void;
  createRoute(
    method: string,
    route: string,
    cb: (req: IncomingMessage, res: ServerResponse) => void
  ): void;
  routes: IRoute[];
}
