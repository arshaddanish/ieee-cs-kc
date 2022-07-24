const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/office-bearers/:year", (req, res) => {
  res.render("office-bearers/" + req.params.year);
});

app.get("/updates", (req, res) => {
  res.render("updates");
});

app.get("/events", (req, res) => {
  res.render("updates");
});

app.get("*", function (req, res) {
  res.render("404");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running at port 3000");
});
