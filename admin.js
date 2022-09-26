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

    page = parseInt(page,10);

    var limit = 9;
    var offset = (page - 1) * limit;

    var events = await db.query(`SELECT id,title,image,
        DATE_FORMAT(date, '%b') AS month, 
        DATE_FORMAT(date, '%d') AS day
        FROM events WHERE category="events" 
        ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`
    );

    var pages = await db.query(`SELECT CEIL(COUNT(*)/${limit}) AS pages FROM events WHERE category="events"`);

    res.render("admin/events", { 
        data:{
            events: events,
            page : page,
            no_of_pages: pages[0].pages,
        }
    });
});

app.get("/admin/delete/:type/:id", async (req, res) => {
    const result = await db.query("DELETE FROM events" + " WHERE id = " + req.params.id + " AND category = '" + req.params.type + "'");
    res.redirect("/admin/"+req.params.type);
});

app.post("/admin/events", upload.single("image"), async (req, res) => {

    imagepath = "/images/uploads/" + req.file.filename;

    const result = await db.query(
        `INSERT INTO events 
        (title, description, image, category, date)
        VALUES 
        ("${req.body.title}", "${req.body.description}", "${imagepath}", "${req.body.type}","${req.body.date}")`
    );

    res.redirect("/admin/home");
});

app.get("/admin/updates", async (req, res) => {
    var page = req.query.page;
    if (page == undefined) {
        page = 1;
    }

    page = parseInt(page,10);

    var limit = 9;
    var offset = (page - 1) * limit;

    var events = await db.query(`SELECT id,title,image,
        DATE_FORMAT(date, '%b') AS month, 
        DATE_FORMAT(date, '%d') AS day
        FROM events WHERE category="updates" 
        ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`
    );

    var pages = await db.query(`SELECT CEIL(COUNT(*)/${limit}) AS pages FROM events WHERE category="updates"`);

    res.render("admin/updates", { 
        data:{
            events: events,
            page : page,
            no_of_pages: pages[0].pages,
        }
    });
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

        imagepath = "/images/uploads/" + req.files.image[0].filename;
        author_imagepath = "/images/uploads/" + req.files.author_image[0].filename;

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
        page = parseInt(page,10);

        var limit = 9;
        var offset = (page - 1) * limit;

        var pages = await db.query(`SELECT CEIL(COUNT(*)/${limit}) AS pages FROM blogs WHERE YEAR(date) = ${blog_year.substr(6)}`);

        var blogs = await db.query(`SELECT 
            id,title,image,
            DATE_FORMAT(date, '%b') AS month,
            DATE_FORMAT(date, '%d') AS day
            FROM blogs WHERE YEAR(date) = ${blog_year.substr(6, 4)}
            ORDER BY date DESC LIMIT ${limit} OFFSET ${offset}`
        );

        res.render("admin/blogs", { 
            data: {
                blogs: blogs,
                page : page,
                no_of_pages: pages[0].pages,
            }, 
            year: blog_year 
        });
    } else res.render("404");
});

module.exports = app;
