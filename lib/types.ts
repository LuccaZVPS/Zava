import { ServerResponse, IncomingMessage } from "http";
export interface IRoute {
  regex?: RegExp;
  method?: string;
  resolver: IResolver;
  route?: string;
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
  ended: boolean;
}
export interface Response extends ServerResponse {
  send(status: number, data?: SendOptions): void;
  ended: boolean;
  sendFile(status: number, filePath: string): void;
}
export type SendOptions =
  | string
  | Record<string, any>
  | number
  | boolean
  | null
  | undefined;
export type ErrorHandler = (req: Request, res: Response, error: Error) => void;
