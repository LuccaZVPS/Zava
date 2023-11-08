import { Zava } from "./zava";
const server = new Zava();

server.post("/post/:id?", async (req, res) => {
  console.log(req.params.id);
  res.send(201, "/post/:id");
});
server.post("/user/:id?", async (req, res) => {
  console.log(req.params.id);
  res.send(201, "/user/:id?");
});
server.post("/user/messages/:id", async (req, res) => {
  console.log(req.params);
  res.send(201, "/user/messages/:id");
});
server.delete("/", async (req, res) => {
  res.send(201, "delete");
});
server.put("/", async (req, res) => {
  res.send(201, "put");
});
server.addExceptionFilter((req, res, e) => {
  res.send(500, e);
});
server.run(3000);
