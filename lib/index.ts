import { Zavva } from "./zavva";
import { Router } from "./router";
const server = new Zavva();
const router = new Router();
router.get("/", async (req, res) => {
  res.send(201, "Só foi");
});
server.addRoutes(router);
server.run(3000);
