import { IncomingMessage, ServerResponse } from "http";
import { CorsOptions } from "../types";

export const cors = (options: CorsOptions) => {
  return (req: IncomingMessage, res: ServerResponse, fn) => {
    const defaultCorsOptions: CorsOptions = {
      allowedOrigins: "*",
      allowedMethods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept",
      exposeHeaders: "",
      allowCredentials: false,
      maxAge: 86400,
    };

    const corsOptions = { ...defaultCorsOptions, ...options };

    res.setHeader("Access-Control-Allow-Origin", corsOptions.allowedOrigins);
    res.setHeader("Access-Control-Allow-Methods", corsOptions.allowedMethods);
    res.setHeader("Access-Control-Allow-Headers", corsOptions.allowedHeaders);
    res.setHeader("Access-Control-Expose-Headers", corsOptions.exposeHeaders);

    if (corsOptions.allowCredentials) {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    if (corsOptions.maxAge) {
      res.setHeader("Access-Control-Max-Age", corsOptions.maxAge.toString());
    }

    if (req.method === "OPTIONS") {
      res["send"](200);
      return;
    }
    fn();
  };
};
