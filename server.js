require("dotenv").config();

const Recaptcha = require('express-recaptcha').RecaptchaV3;
const sassMiddleware = require("node-sass-middleware");
const bodyParser = require("body-parser");
const nunjucks = require("nunjucks");
const express = require("express");
const path = require("path");
const odbc = require("odbc");
const { title } = require("process");
const app = express();
const port = 8080;

const recaptcha = new Recaptcha(
  process.env.CAPTCHA_SITE_KEY,
  process.env.CAPTCHA_API_KEY,
  { callback:'resRecaptcha' }
);

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

app.set("view engine", "html");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(function(req, res, next){
  req.breadcrumb = '<a style="color: #000000" onmouseover="this.style.color=\'#F5E400\';"; href="/"><i class="fas fa-home"></i></a> / ' + req.originalUrl.substring(1).split('/').map(item => `<a>${item}</a>`).join("");
  next();
});

// HOME
app.get("/", async (req, res) => {
  res.render("home.html", { title: 'Accueil' });
});

app.get("/annonce", recaptcha.middleware.render, (req, res) => {
  res.render("create.html", { captcha: res.recaptcha, title: 'Ajouter une annonce', breadcrumb: req.breadcrumb });
});

app.get("/annonce/{id}", async (req, res) => {
  try {
    const connection = await odbc.connect(process.env.CONNECTION);
    const ad = await connection.query(`SELECT * FROM FichesSaisies WHERE Id= ${req.params.id}`);

    res.render("ad.html", { ad: ad, title: 'annonce', breadcrumb: req.breadcrumb });
  } catch (error) {
    res.render("error.html", { error: error });
  }
});

app.get("/annonces", async (req, res) => {
  try {
    // const connection = await odbc.connect(process.env.CONNECTION);
    // const ads = await connection.query(`SELECT * FROM FichesSaisies LIMIT 8`);

    const ads = [
      {
        title: "Chien Marron",
        description:
          "Petit chien marron, perdu pas très loin de la piscine de koutio. Merci de me contacter au 000000",
        image:
          "https://lemagduchat.ouest-france.fr/images/dossiers/2020-01/korat-073252.jpg"
      },
      {
        title: "Chat Gris",
        description:
          "Petit chat gris, perdu à Magenta pas très loin du stage de Magenta",
        image:
          "https://lemagduchat.ouest-france.fr/images/dossiers/2020-01/korat-073252.jpg"
      },
      {
        title: "Chat blanc, avec des tâches grise",
        description:
          "Petit chat blanc avec des petites tâches gris, perdu dans le quartier de rivière salée",
        image:
          "https://lemagduchat.ouest-france.fr/images/dossiers/2020-01/korat-073252.jpg"
      },
      {
        title: "Petit chien brun",
        description: "Petit chien brun perdu, dans le quartien de ducos",
        image:
          "https://lemagduchat.ouest-france.fr/images/dossiers/2020-01/korat-073252.jpg"
      },
      {
        title: "Chat Marron",
        description: "Petit chat marron, perdu dans le quartie du Mont-dore",
        image:
          "https://lemagduchat.ouest-france.fr/images/dossiers/2020-01/korat-073252.jpg"
      },
      {
        title: "Chien blanc",
        description: "Chien blanc perdu dans nouméa",
        image:
          "https://lemagduchat.ouest-france.fr/images/dossiers/2020-01/korat-073252.jpg"
      }
    ];

    res.render("ads.html", { ads: ads, title: 'Annonces', breadcrumb: req.breadcrumb });
  }  catch (error) {
    res.render("error.html", { error: error });
  }
});

app.get("/api/annonces", async (req, res) => {
  const animalType = req.body.animalType;
  const date = req.body.date;

  try {
    const connection = await odbc.connect(process.env.CONNECTION);
    const ads = await connection.query(`SELECT * FROM FichesSaisies WHERE AnimalType = ${animal} AND WHERE Date = ${date} LIMIT 8`);

    res.json({ ads: ads });
  } catch (error) {
    res.render("error.html", { error: error, breadcrumb: req.breadcrumb });
  }
});

app.post("/api/annonce", recaptcha.middleware.verify, (req, res) => {
  const description = req.body.description;
  const image = req.body.image;

  const ad = {
    description: description,
    image: image
  };

  if (!req.recaptcha.error) {
    // success code
    
  } else {
    // error code
  }

  res.json(ad, { error:req.recaptcha.error, breadcrumb: req.breadcrumb });
});

app.post("/api/contact", recaptcha.middleware.verify, (req, res) => {
  const message = req.body.message;
  if (!req.recaptcha.error) {
    // success code
    
  } else {
    // error code
  }

  res.json({ message: message }, { error:req.recaptcha.error });
});

app.get("/contact", async (req, res) => {
  res.render("contact.html", {title: 'Contact', breadcrumb: req.breadcrumb});
});
app.get("/contact", recaptcha.middleware.render, async (req, res) => {
  res.render("contact.html", { captcha: res.recaptcha });

});

app.get("/conseils", async (req, res) => {
  res.render("advises.html", {title: 'Conseils', breadcrumb: req.breadcrumb });
});

app.get("/partenaires", async (req, res) => {
  res.render("partners.html",{title: 'Partenaires', breadcrumb: req.breadcrumb });
});

app.get("/mentions-legales", async (req, res) => {
  res.render("mentions.html", {title: 'Mentions legales', breadcrumb: req.breadcrumb });
});

app.get("/tutoriel", async (req, res) => {
  res.render("tutoriel.html", { breadcrumb: req.breadcrumb });
});

app.post("/api/comments", (req, res) => {
  const commentaires = req.body.commentaires;

  res.json({ commentaires: commentaires, breadcrumb: req.breadcrumb });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
