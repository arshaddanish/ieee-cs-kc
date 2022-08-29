const express = require("express");
const app = express();

app.get("/admin", (req, res) => {
  res.render("admin/login");
});

app.post("/admin", (req, res) => {
  console.log(req.body);
  res.redirect("/admin/home");
});

app.get("/admin/home", (req, res) => {
  res.render("admin/home");
});

app.get("/admin/events", (req, res) => {
  res.render("admin/events");
});

app.get("/admin/updates", (req, res) => {
  res.render("admin/updates");
});

app.get("/admin/statistics", (req, res) => {
  res.render("admin/statistics");
});

app.get("/admin/add-blog", (req, res) => {
  res.render("admin/add-blog");
});

app.get("/admin/statistics", (req, res) => {
  res.render("admin/statistics");
});

app.get("/admin/:blog_year", (req, res) => {
  blog_year = req.params.blog_year;
  if (blog_year.substr(0, 5) === "blogs")
    res.render("admin/blogs", { year: blog_year });
  else res.render("404");
});

module.exports = app;
