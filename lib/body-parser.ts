import { Request, Response } from "./types";

export const bodyParser = (
  req: Request,
  res: Response
): Promise<{ body: any; status: boolean }> => {
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
        resolve({ body, status: true });
      } catch {
        res.writeHead(400);
        res.end("Invalid body provided");
        resolve({ body: "", status: false });
      }
    });
  });
};
