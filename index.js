const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("The Toys store server is running");
});
app.listen(port, () => {
  console.log(`Toys Serber is running on port:${port}`);
});
