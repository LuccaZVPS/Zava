export const bodyParser = () => {
  return async (req, res, fn) => {
    const bodyParserFn = new Promise((resolve, reject) => {
      let body = Buffer.from("");

      req.on("data", (chunk) => {
        if (Buffer.length + chunk.length > 1024 * 1024) {
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
          } else {
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
