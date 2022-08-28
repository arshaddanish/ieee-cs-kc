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

app.get("/techthreads/:edition", (req, res) => {
  res.render("techthreads/" + req.params.edition);
});

app.get("/previous-blogs/:year", (req, res) => {
  res.render("prev-blogs/" + req.params.year);
});

app.get("/previous-blogs/:year/:blog", (req, res) => {
  res.render("prev-blogs/blog");
});

app.get("/updates", (req, res) => {
  res.render("updates");
});

app.get("/updates/:update", (req, res) => {
  res.render("updates-single");
});

app.get("/events/", (req, res) => {
  res.render("events");
});

app.get("/events/:event", (req, res) => {
  res.render("events-single");
});

app.get("/sb-chapters", (req, res) => {
  res.render("sb-chapters");
});

app.get("*", function (req, res) {
  res.render("404");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running at port 3000");
});
