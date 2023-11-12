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
