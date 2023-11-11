import { Zava as ZavaClass } from "./zava";
import { Router as RouterClass } from "./router";
const Zava = () => {
  return new ZavaClass();
};
export const Router = () => {
  return new RouterClass();
};
export * from "./types";
export default Zava;
