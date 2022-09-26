const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const axios = require("axios");
const multer = require("multer");

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/images/uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

var upload = multer({ storage: storage });

const FormData = require("form-data");
const fs = require("fs");

const db = require("./services/db");

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
    const result = await db.query("DELETE FROM events" + " WHERE id = " + req.params.id + " AND category = '" + req.params.type + "'");
    res.redirect("/admin/"+req.params.type);
});

app.post("/admin/events", upload.single("image"), async (req, res) => {

    imagepath = "/public/images/uploads/" + req.file.filename;

    const result = await db.query(
        `INSERT INTO events 
        (title, description, image, category, date)
        VALUES 
        ("${req.body.title}", "${req.body.description}", "${imagepath}", "${req.body.type}","${req.body.date}")`
    );

    console.log(result);
    res.redirect("/admin/home");
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

        imagepath = "/public/images/uploads/" + req.files.image[0].filename;
        author_imagepath = "/public/images/uploads/" + req.files.author_image[0].filename;

        const result = db.query(`INSERT INTO blogs 
            (title, content, date ,image, author, author_image, college, linkedin)
            VALUES
            ("${req.body.title}", "${req.body.content}", "${req.body.date}" ,"${imagepath}", "${req.body.name}", "${author_imagepath}", "${req.body.college}", "${req.body.linkedin}")`
        );

        var year = new Date().getFullYear();
        res.redirect("/admin/blogs-" + year);
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
