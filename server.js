require("dotenv").config();

const sassMiddleware = require("node-sass-middleware");
const nunjucks = require("nunjucks");
const express = require("express");
const path = require("path");
const odbc = require("odbc");
const app = express();
const port = 8080;

// odbc.connect(`DRIVER={HFSQL};Server Name=139.99.135.47;Server Port=4900;Database=LostDogCCI;UID=DevWeb;PWD=ToTheMoon2020;`, (error, connection) => {
//   console.error(error.odbcErrors[0].code);
// });

nunjucks.configure("views", {
    autoescape: true,
    noCache: true,
    watch: true,
    express: app
});

app.use(
    sassMiddleware({
        dest: path.join(__dirname, "public"),
        src: path.join(__dirname, "assets"),
        sourceMap: true,
        debug: false
    })
);

app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async(req, res) => {
    const dogs = {};
    res.render("home.html", { dogs: dogs });
});

app.get("/contact", async(req, res) => {
    res.render("contact.html");
});

app.get("/annonces", async(req, res) => {
    const ads = [{}, {}, {}, {}, {}, {}];
    res.render("ads.html", { ads: ads });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});