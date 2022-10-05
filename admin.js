const express = require("express");
const app = express();
const session = require("express-session");
const cors = require("cors");
app.use(cors());

const bodyParser = require("body-parser");
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const axios = require("axios");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/images/uploads");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

var upload = multer({ storage: storage });

const FormData = require("form-data");
const fs = require("fs");

const db = require("./services/db");

// app.get("/createdb", async (req, res) => {
//   try {
//     const r = await db.query(
//       `create table stats (id int auto_increment primary key, chapters int, students int, professionals int)`
//     );
//     console.log(r);
//   } catch (e) {
//     console.log(e);
//   }
// });

app.get("/admin", (req, res) => {
  if (req.session.loggedin) res.redirect("/admin/home");
  else res.render("admin/login");
});

app.post("/admin", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  if (username && password) {
    let r = await db.query(
      "SELECT * FROM admin WHERE username = ? AND password = ?",
      [username, password]
    );
    if (r[0].id) {
      req.session.loggedin = true;
      req.session.username = username;
      res.redirect("/admin/home");
    } else {
      res.redirect("/admin");
    }
  } else {
    res.redirect("/admin");
  }
});

app.get("/admin/logout", (req, res) => {
  req.session.loggedin = false;
  res.redirect("/admin");
});

app.get("/admin/home", (req, res) => {
  if (!req.session.loggedin) res.redirect("/admin");
  else res.render("admin/home");
});

app.post("/admin/events", upload.single("image"), async (req, res) => {
  if (!req.session.loggedin) res.redirect("/admin");
  else {
    let description = req.body.description.replace(/"/g, '\\"');
    let imagepath = "/images/uploads/" + req.file.filename;
    // console.log(imagepath);
    if (req.body.type === "events") {
      const result = await db.query(
        `INSERT INTO events 
          (title, description, image, doc)
          VALUES 
          ("${req.body.title}", "${description}", "${imagepath}", "${req.body.date}")`
      );
      // console.log(result);
      res.redirect("/admin/home");
    } else {
      const result = await db.query(
        `INSERT INTO updates 
          (title, description, image, doc)
          VALUES 
          ("${req.body.title}", "${description}", "${imagepath}", "${req.body.date}")`
      );
      res.redirect("/admin/home");
    }
  }
});

app.get("/admin/events", async (req, res) => {
  if (!req.session.loggedin) res.redirect("/admin");
  else {
    var page = req.query.page;
    if (page == undefined) {
      page = 1;
    }

    page = parseInt(page, 10);

    var limit = 9;
    var offset = (page - 1) * limit;

    var events = await db.query(`SELECT id,title,image,
        DATE_FORMAT(doc, '%b') AS month, 
        DATE_FORMAT(doc, '%d') AS day
        FROM events 
        ORDER BY doc DESC, id DESC LIMIT ${limit} OFFSET ${offset}`);

    var pages = await db.query(
      `SELECT CEIL(COUNT(*)/${limit}) AS pages FROM events`
    );

    res.render("admin/events", {
      data: {
        events: events,
        page: page,
        no_of_pages: pages[0].pages,
      },
    });
  }
});

app.get("/admin/delete/events/:id", async (req, res) => {
  if (!req.session.loggedin) res.redirect("/admin");
  else {
    const result = await db.query(
      `DELETE FROM events WHERE id = ${req.params.id}`
    );
    res.redirect("/admin/events");
  }
});

app.get("/admin/delete/updates/:id", async (req, res) => {
  if (!req.session.loggedin) res.redirect("/admin");
  else {
    const result = await db.query(
      `DELETE FROM updates WHERE id = ${req.params.id}`
    );
    res.redirect("/admin/updates");
  }
});

app.get("/admin/updates", async (req, res) => {
  if (!req.session.loggedin) res.redirect("/admin");
  else {
    var page = req.query.page;
    if (page == undefined) {
      page = 1;
    }

    page = parseInt(page, 10);

    var limit = 9;
    var offset = (page - 1) * limit;

    var events = await db.query(`SELECT id,title,image,
          DATE_FORMAT(doc, '%b') AS month, 
          DATE_FORMAT(doc, '%d') AS day
          FROM updates 
          ORDER BY doc DESC, id DESC LIMIT ${limit} OFFSET ${offset}`);

    var pages = await db.query(
      `SELECT CEIL(COUNT(*)/${limit}) AS pages FROM events`
    );

    res.render("admin/updates", {
      data: {
        events: events,
        page: page,
        no_of_pages: pages[0].pages,
      },
    });
  }
});

app.get("/admin/statistics", async (req, res) => {
  if (!req.session.loggedin) res.redirect("/admin");
  else {
    let stats = await db.query(`SELECT * FROM stats`);
    res.render("admin/statistics", { stats: stats });
  }
});

app.post("/admin/statistics", async (req, res) => {
  if (!req.session.loggedin) res.redirect("/admin");
  else {
    let { chapters, students, professionals } = req.body;
    let stats =
      await db.query(`UPDATE stats set chapters = ${chapters}, students = ${students}, 
  professionals = ${professionals} where id = 1`);
    res.redirect("/admin/statistics");
  }
});

app.get("/admin/add-blog", (req, res) => {
  if (!req.session.loggedin) res.redirect("/admin");
  else {
    res.render("admin/add-blog");
  }
});

app.post(
  "/admin/add-blog",
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "author_image",
      maxCount: 1,
    },
  ]),
  (req, res) => {
    if (!req.session.loggedin) res.redirect("/admin");
    else {
      imagepath = "/images/uploads/" + req.files.image[0].filename;
      author_imagepath =
        "/images/uploads/" + req.files.author_image[0].filename;

      const result = db.query(`INSERT INTO blogs 
            (title, content, doc ,image, author, author_image, college, linkedin)
            VALUES
            ("${req.body.title}", "${req.body.content}", "${req.body.date}" ,"${imagepath}", "${req.body.name}", "${author_imagepath}", "${req.body.college}", "${req.body.linkedin}")`);

      var year = new Date().getFullYear();
      res.redirect("/admin/blogs-" + year);
    }
  }
);

app.get("/admin/edit-update", (req, res) => {
  if (!req.session.loggedin) res.redirect("/admin");
  else {
    res.render("admin/edit-update");
  }
});

app.get("/admin/edit-event", (req, res) => {
  if (!req.session.loggedin) res.redirect("/admin");
  else {
    res.render("admin/edit-event");
  }
});

app.get("/admin/edit-blog", (req, res) => {
  if (!req.session.loggedin) res.redirect("/admin");
  else {
    res.render("admin/edit-blog");
  }
});

app.get("/admin/:blog_year", async (req, res) => {
  if (!req.session.loggedin) res.redirect("/admin");
  else {
    blog_year = req.params.blog_year;
    if (blog_year.substr(0, 5) === "blogs") {
      var page = req.query.page;
      if (page == undefined) {
        page = 1;
      }
      page = parseInt(page, 10);

      var limit = 9;
      var offset = (page - 1) * limit;

      var pages = await db.query(
        `SELECT CEIL(COUNT(*)/${limit}) AS pages FROM blogs WHERE YEAR(date) = ${blog_year.substr(
          6
        )}`
      );

      var blogs = await db.query(`SELECT 
            id,title,image,
            DATE_FORMAT(doc, '%b') AS month,
            DATE_FORMAT(doc, '%d') AS day
            FROM blogs WHERE YEAR(date) = ${blog_year.substr(6, 4)}
            ORDER BY date DESC LIMIT ${limit} OFFSET ${offset}`);

      res.render("admin/blogs", {
        data: {
          blogs: blogs,
          page: page,
          no_of_pages: pages[0].pages,
        },
        year: blog_year,
      });
    } else res.render("404");
  }
});

module.exports = app;
