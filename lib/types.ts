import { ServerResponse, IncomingMessage } from "http";
export interface IRoute {
  regex: RegExp;
  method: string;
  resolvers: IResolver[];
  route: string;
}

export type IResolver = (
  req: Request,
  res: Response,
  nextFn?: () => void
) => void;

export interface IRouter {
  routes: IRoute[];
}

export interface Request extends IncomingMessage {
  body: any;
  query: any;
  params: any;
  pathConfig: string;
}
export interface Response extends ServerResponse {
  send(status: number, data?: SendOptions): void;
}
export type SendOptions = string | object[] | object | number;
export type ErrorHandler = (req: Request, res: Response, error: Error) => void;
export interface GlobalResolver {
  route?: string;
  resolvers: IResolver[];
  regex?: RegExp;
}
