import { Zava as ZavaClass } from "./zava";
import { Router as RouterClass } from "./router";
export * from "./middlewares/cors";
const Zava = () => {
  return new ZavaClass();
};
export const Router = () => {
  return new RouterClass();
};
export * from "./types";
export default Zava;
export const Static = ZavaClass.Static;
const app = Zava();
app.get("/", (req, res) => {
  res.send(200, "Get");
});
app.post("/", (req, res) => {
  res.send(200, "post");
});
app.put("/", (req, res) => {
  res.send(200, "put");
});
app.delete("/", (req, res) => {
  res.send(200, "delete");
});
app.patch("/", (req, res) => {
  res.send(200, "patch");
});

app.run(3000);
