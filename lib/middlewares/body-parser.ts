import { Request } from "../types";
const BODY_LENGTH = 1024 * 1024;
export const bodyParser = () => {
  return async (req: Request, res, fn) => {
    if (req.headers["content-type"] !== "application/json") {
      fn();
      return;
    }
    let contentLength = parseInt(req.headers["content-length"], 10);
    contentLength = isNaN(contentLength) ? contentLength : 1;
    if (contentLength > BODY_LENGTH) {
      res.send(413, "Body too large");
      return;
    }
    const bodyParserFn = async () => {
      let data = Buffer.from("");
      return new Promise((resolve, reject) => {
        req.on("readable", () => {
          let chunk;

          while ((chunk = req.read()) != null) {
            if (data.length + chunk.length > BODY_LENGTH) {
              res.send(413, "Body too large");
              return reject(null);
            }
            data = Buffer.concat([data, chunk]);
          }
        });
        req.on("end", () => {
          try {
            const body = JSON.parse(data.toString());
            req.body = body;
            resolve(null);
          } catch (e) {
            console.log(e);
            res.send(500);
          }
        });
      });
    };
    await bodyParserFn();
    fn();
  };
};
