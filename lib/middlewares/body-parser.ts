import { IResolver, Request, Response } from "../types";

export const bodyParser: IResolver = (req: Request, res: Response) => {
  return new Promise((resolve) => {
    let body = Buffer.from("");

    req.on("data", (chunk) => {
      if (
        Buffer.length + chunk.length >
        1024 * 1024 // 1 MB;
      ) {
        resolve({ body: "", status: false });
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
        } else {
          body = {} as Buffer;
        }
        req["body"] = body;
        resolve(null);
      } catch {
        res.writeHead(400);
        res.end("Invalid body provided");
        resolve(null);
      }
    });
  });
};
