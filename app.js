const express = require("express");
const app = express();
const axios = require("axios");
const fs = require("fs");
const db = require("./services/db");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
const cors = require("cors");
app.use(cors());

let adminRouter = require("./admin");
app.use(adminRouter);

function getData(path) {
  const jsonData = fs.readFileSync(path);
  return JSON.parse(jsonData);
}

app.get("/", async (req, res) => {
  let events = await db.query(`SELECT id,title,description,image,
  DATE_FORMAT(doc, '%b') AS month, 
  DATE_FORMAT(doc, '%d') AS day
  FROM events 
  ORDER BY doc DESC LIMIT 6`);
  let updates = await db.query(`SELECT id,title,description,image,
  DATE_FORMAT(doc, '%b') AS month, 
  DATE_FORMAT(doc, '%d') AS day
  FROM updates 
  ORDER BY doc DESC LIMIT 6`);
  res.render("home", { events: events, updates: updates });
});

app.get("/office-bearers/:year", (req, res) => {
  const year = req.params.year;
  const data = getData("public/content/teams/team-" + year + ".json");

  res.render("office-bearers", { data: data, year: year });
});

app.get("/techthreads/:edition", (req, res) => {
  res.render("techthreads/" + req.params.edition);
});

app.get("/previous-blogs/:year", (req, res) => {
  res.render("prev-blogs/blogs", { year: req.params.year });
});

app.get("/previous-blogs/:year/:blog", (req, res) => {
  let year = req.params.year;
  res.render("prev-blogs/blog", { year: year });
});

app.get("/compile/:year/:edition", (req, res) => {
  let year = req.params.year;
  let edition = req.params.edition;
  res.sendFile(
    "./public/compile/" + year + "/" + edition + "/" + edition + ".html",
    { root: __dirname }
  );
});

app.get("/updates", async (req, res) => {
  var page = req.query.page;
  if (page == undefined) {
    page = 1;
  }

  page = parseInt(page, 10);

  var limit = 9;
  var offset = (page - 1) * limit;

  var events = await db.query(`SELECT id,title,description,image,
          DATE_FORMAT(doc, '%b') AS month, 
          DATE_FORMAT(doc, '%d') AS day
          FROM updates 
          ORDER BY doc DESC LIMIT ${limit} OFFSET ${offset}`);

  var pages = await db.query(
    `SELECT CEIL(COUNT(*)/${limit}) AS pages FROM events`
  );

  res.render("updates", {
    data: {
      events: events,
      page: page,
      no_of_pages: pages[0].pages,
    },
  });
});

app.get("/updates/:update", async (req, res) => {
  var event = await db.query(`SELECT id,title,description,image,
        DATE_FORMAT(doc, '%b') AS month, 
        DATE_FORMAT(doc, '%d') AS day,
        DATE_FORMAT(doc, '%Y') AS year
        FROM updates 
        WHERE id = ${req.params.update}
        ORDER BY id DESC`);
  // console.log(event);
  res.render("updates-single", { data: event[0] });
});

app.get("/events", async (req, res) => {
  var page = req.query.page;
  if (page == undefined) {
    page = 1;
  }

  page = parseInt(page, 10);

  var limit = 9;
  var offset = (page - 1) * limit;

  var events = await db.query(`SELECT id,title,description,image,
        DATE_FORMAT(doc, '%b') AS month, 
        DATE_FORMAT(doc, '%d') AS day
        FROM events 
        ORDER BY doc DESC LIMIT ${limit} OFFSET ${offset}`);

  var pages = await db.query(
    `SELECT CEIL(COUNT(*)/${limit}) AS pages FROM events`
  );

  res.render("events", {
    data: {
      events: events,
      page: page,
      no_of_pages: pages[0].pages,
    },
  });
});

app.get("/events/:event", async (req, res) => {
  var event = await db.query(`SELECT id,title,description,image,
        DATE_FORMAT(doc, '%b') AS month, 
        DATE_FORMAT(doc, '%d') AS day,
        DATE_FORMAT(doc, '%Y') AS year
        FROM events 
        WHERE id = ${req.params.event}
        ORDER BY id DESC`);
  // console.log(event);
  res.render("events-single", { data: event[0] });
});

app.get("/sb-chapters", (req, res) => {
  const data = getData("public/content/sb-chapters.json");
  res.render("sb-chapters", { data: data });
});

app.get("*", function (req, res) {
  res.render("404");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running at port 3000");
});
