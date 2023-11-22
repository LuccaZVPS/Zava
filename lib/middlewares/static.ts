import rootPath from "pkg-dir";
import path from "path";
import parser from "parseurl";
import mime from "mime";
import fs from "fs";
import { IResolver } from "../types";

export const Static = (folderName: string): IResolver => {
  const folderPath = rootPath.sync() + "/" + folderName;
  return (req, res) => {
    res["ended"] = true;
    if (req.method !== "GET") {
      res.send(405);
      return;
    }
    const url = parser(req);
    if (!url.pathname.includes(".")) {
      res.send(404);
      return;
    }

    const filePath = path.join(
      folderPath,
      url.pathname.replace(req.pathConfig, "")
    );

    res["ended"] = true;
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.writeHead(404);
        res.end("Not Found");
      } else {
        const fileStream = fs.createReadStream(filePath);

        res.writeHead(200, {
          "Content-Type": mime.lookup(filePath) || "application/octet-stream",
          "Content-Disposition": "inline",
        });

        fileStream.pipe(res);

        fileStream.on("error", (error) => {
          console.log(error);
          res.writeHead(500);
          res.end("Internal Server Error");
        });
      }
    });
  };
};
