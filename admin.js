const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const axios = require("axios");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const FormData = require("form-data");
const fs = require("fs");

const apiRoute = "https://ieee-cs-kc.herokuapp.com/api/";

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

app.get("/admin/events", async (req, res) => {
  var page = req.query.page;
  if (page == undefined) {
    page = 1;
  }

  var url = apiRoute + "items/events?page=" + page;
  const apiResponse = await axios.get(url);

  const data = apiResponse.data;
  JSON.stringify(data);

  res.render("admin/events", { data: data.data });
});

app.get("/admin/delete/:type/:id", async (req, res) => {
  let url = "/items/" + req.params.type + "/" + req.params.id;
  await axios.delete(url);
  res.redirect("/admin/"+req.params.type);
});

app.post("/admin/events", upload.single("image"), (req, res) => {
  form_data = new FormData();

  form_data.append("name", req.body.title);
  form_data.append("description", req.body.description);
  form_data.append("category", req.body.type);
  form_data.append("date", req.body.date);
  form_data.append("image", fs.createReadStream(req.file.path));

  axios
    .post(apiRoute + "items", form_data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      // console.log(response.data);
      res.redirect("/admin/home");
    });
});

app.get("/admin/updates", async (req, res) => {
  var page = req.query.page;
  if (page == undefined) {
    page = 1;
  }

  var url = apiRoute + "items/updates?page=" + page;
  const apiResponse = await axios.get(url);

  const data = apiResponse.data;
  JSON.stringify(data);

  res.render("admin/updates", { data: data.data });
});

app.get("/admin/statistics", (req, res) => {
  res.render("admin/statistics");
});

app.get("/admin/add-blog", (req, res) => {
  res.render("admin/add-blog");
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
    form_data = new FormData();

    form_data.append("title", req.body.title);
    form_data.append("content", req.body.content);
    form_data.append("date", req.body.date);
    form_data.append("image", fs.createReadStream(req.files.image[0].path));

    form_data.append("name", req.body.name);
    form_data.append("college", req.body.college);
    form_data.append("linkedin", req.body.linkedin);
    form_data.append(
      "author_image",
      fs.createReadStream(req.files.author_image[0].path)
    );

    axios
      .post(apiRoute + "blogs", form_data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        var year = new Date().getFullYear();
        res.redirect("/admin/blogs-" + year);
      });
  }
);

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

app.get("/admin/:blog_year", async (req, res) => {
  blog_year = req.params.blog_year;
  if (blog_year.substr(0, 5) === "blogs") {
    var page = req.query.page;
    if (page == undefined) {
      page = 1;
    }

    var url = apiRoute + "blogs/year/" + blog_year.substr(6) + "?page=" + page;
    const apiResponse = await axios.get(url);

    const data = apiResponse.data;
    JSON.stringify(data);

    res.render("admin/blogs", { data: data.data, year: blog_year });
  } else res.render("404");
});

module.exports = app;
