import { Request } from "../types";
const BODY_LENGTH = 1024 * 1024
export const bodyParser = () => {
  return async (req:Request, res, fn) => {
    if (req.headers["content-type"] !== "application/json") {
      fn()
      return 
    }
    let  contentLength = parseInt(req.headers['content-length'], 10);
    contentLength = isNaN(contentLength) ? contentLength : 1
    if (contentLength > BODY_LENGTH) {
      res.send(413,"Body too large");
      return;
    }
    const bodyParserFn = new Promise((resolve, reject) => {
      let body = Buffer.from("");

      req.on("data", (chunk) => {
        if (Buffer.length + chunk.length > BODY_LENGTH) {
          reject(new Error("Body too large"));
          res.writeHead(413);
          res.end("Body too large");
          req.destroy();
        } else {
          body = Buffer.concat([body, chunk]);
        }
      });

      req.on("end", () => {
        try {
          if (body.length > 0) {
            body = JSON.parse(body.toString("utf-8"));
          }
          else {
            body = {} as Buffer;
          }
          req["body"] = body;
          fn();
          resolve(null);
        } catch (error) {
          res.writeHead(400);
          res.end("Invalid body provided");
          reject(error);
        }
      });
    });
    await bodyParserFn;
  };
};
