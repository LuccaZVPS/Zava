import { ServerResponse, IncomingMessage } from "http";
export interface IRoute {
  url: string;
  method: string;
  resolvers: IResolver[];
}

export type IResolver = (
  req: Request,
  res: Response,
  nextFn?: () => void
) => void;

export interface IRouter {
  get(route: string, ...cb: IResolver[]): void;
  post(route: string, ...cb: IResolver[]): void;
  put(route: string, ...cb: IResolver[]): void;
  delete(route: string, ...cb: IResolver[]): void;
  patch(route: string, ...cb: IResolver[]): void;
  patch(route: string, ...cb: IResolver[]): void;
  static(route: string, ...cb: IResolver[]): void;
  routes: IRoute[];
}

export interface Request extends IncomingMessage {
  body: any;
  query: any;
  params: any;
}
export interface Response extends ServerResponse {
  send(status: number, data?: SendOptions): void;
}
export type SendOptions = string | object[] | object | number;
export type ErrorHandler = (req: Request, res: Response, error: Error) => void;
