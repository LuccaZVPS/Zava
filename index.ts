import zava, { Static } from "./lib/index";
const app = zava();

app.post("/teste/:id/:id2", (req, res) => {
  console.log(req.body);
  console.log(req.query);
  console.log(req.params);
  res.send(200, req.params);
});
app.apply("/files", Static("uploads"));
app.run(3000);
