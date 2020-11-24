require("dotenv").config();

const sassMiddleware = require("node-sass-middleware");
const nunjucks = require("nunjucks");
const express = require("express");
const path = require("path");
const odbc = require("Odbc");
const app = express();
const db = odbc();
const port = 8080;

db.openSync(`
   DRIVER={${process.env.DRIVER}};
   Server Name=${process.env.SERVER_NAME};
   Server Port=${process.env.SERVER_PORT};
   Database=${process.env.DATABASE};
   UID=${process.env.UID};
   PWD=${process.env.PWD};
`);

nunjucks.configure("views", {
  autoescape: true,
  express: app
});

app.use(
  sassMiddleware({
    dest: path.join(__dirname, "public"),
    src: path.join(__dirname, "assets"),
    sourceMap: true,
    debug: true
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res) {
  const dogs = db.querySync(`select * from dogs`);

  res.render("home.html", { dogs: dogs });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
