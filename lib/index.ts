import { ServerResponse } from "http";
import { Zavva } from "./zavva";
import { Router } from "./router";
const server = new Zavva();
const router = new Router();
router.get("/", (req, res) => {
  res.writeHead(200);
});
server.addRoutes(router);
server.run(3000);
