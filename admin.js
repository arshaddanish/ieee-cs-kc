const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const axios = require("axios");
const multer = require("multer");
const upload = multer({dest: "uploads/"});

const FormData = require("form-data");
const fs = require("fs");

const url = "https://ieee-cs-kc.herokuapp.com/api/"
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

app.post("/admin/events", upload.single('image') ,(req, res) => {
	  form_data = new FormData();
	  
	  form_data.append("name", req.body.title);
	  form_data.append("description", req.body.description);
	  form_data.append("category", req.body.type);
	  form_data.append("date", req.body.date);
	  form_data.append("image", fs.createReadStream(req.file.path));
	
	  axios.post(url + "items", form_data,{
	    headers: {
	      "Content-Type": "multipart/form-data"
	    },
	  }).then(response => {
	    console.log(response.data);
	    res.redirect("/admin/events");
	  });
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

app.get("/admin/edit-update", (req, res) => {
  res.render("admin/edit-update");
});

app.get("/admin/edit-event", (req, res) => {
  res.render("admin/edit-event");
});

app.get("/admin/edit-blog", (req, res) => {
  res.render("admin/edit-blog");
});

app.get("/admin/:blog_year", (req, res) => {
  blog_year = req.params.blog_year;
  if (blog_year.substr(0, 5) === "blogs")
    res.render("admin/blogs", { year: blog_year });
  else res.render("404");
});

module.exports = app;
