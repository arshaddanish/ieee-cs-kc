const express = require("express");
const app = express();
const axios = require("axios");
const fs = require("fs");
const apiRoute = "https://ieee-cs-kc.herokuapp.com/api/";

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
// const cors = require('cors');
// app.use(cors())

let adminRouter = require("./admin");
app.use(adminRouter);

function getData (path) {
	const jsonData = fs.readFileSync(path);
	return JSON.parse(jsonData);
}

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
  res.render("prev-blogs/blogs" , {year: req.params.year});
});

app.get("/previous-blogs/:year/:blog", (req, res) => {
  res.render("prev-blogs/blog");
});

app.get("/updates", async (req, res) => {
  var page = req.query.page;
  if (page == undefined) {
	page = 1;
  }

  var url = apiRoute + "items/updates?page=" + page;
  const apiResponse = await axios.get(url)
  
  const data = apiResponse.data;
  JSON.stringify(data);
  res.render("updates", { data: data.data });
});

app.get("/updates/:update",async (req, res) => {
  var url = apiRoute + "items/updates/" + req.params.update;
  const apiResponse = await axios.get(url)
  
  const data = apiResponse.data;
  JSON.stringify(data);

  res.render("updates-single", { data: data.data });
});

app.get("/events/", async (req, res) => {
	
  var page = req.query.page;
  if (page == undefined) {
	page = 1;
  }

  var url = apiRoute + "items/events?page=" + page;
  const apiResponse = await axios.get(url)
  
  const data = apiResponse.data;
  JSON.stringify(data);
  res.render("events", { data: data.data });
});

app.get("/events/:event", async(req, res) => {
  
  var url = apiRoute + "items/events/" + req.params.event;
  const apiResponse = await axios.get(url)
  
  const data = apiResponse.data;
  JSON.stringify(data);

  res.render("events-single", { data: data.data });
});

app.get("/sb-chapters", (req, res) => {

  const data = getData("/public/content/sb-chapters.json");
  console.log(data);
  res.render("sb-chapters", { data: data });

});

app.get("*", function (req, res) {
  res.render("404");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running at port 3000");
});
