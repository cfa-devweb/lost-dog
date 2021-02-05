require("dotenv").config();

const Recaptcha = require("express-recaptcha").RecaptchaV3;
const sassMiddleware = require("node-sass-middleware");
const fileUpload = require('express-fileupload');
const bodyParser = require("body-parser");
const nunjucks = require("nunjucks");
const express = require("express");
const ftp = require("basic-ftp")
const path = require("path");
const odbc = require("odbc");
const fs = require("fs");
const app = express();
const port = 8080;

const recaptcha = new Recaptcha(
  process.env.CAPTCHA_SITE_KEY,
  process.env.CAPTCHA_API_KEY,
  { callback: "resRecaptcha" }
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

app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "html");
app.use(function(req, res, next) {
  req.breadcrumb =
    '<a class="bread-js" href="/"><i class="fas fa-home"></i> Accueil </a> > ' +
    req.originalUrl
      .substring(1)
      .split("/")
      .map(item => `<a>${item}</a>`)
      .join("");
  next();
});

// HOME
app.get("/", async (req, res) => {
  try {
    const connection = await odbc.connect(process.env.CONNECTION);
    const ads = await connection.query(`SELECT IDFichesSaisies, TypeAnimal, CAST(Commentaires AS VARCHAR(8000)) AS Commentaires, DATE, TYPE FROM FichesSaisies ORDER BY Date DESC LIMIT 4`);
    const homeparteners = await connection.query(`SELECT IDPartenaires, LienWeb, NbImages FROM Partenaires WHERE TYPE = 'PARTENAIRE' ORDER BY RAND() DESC LIMIT 3`);
    
    res.render("home.html", {
      homeparteners: homeparteners,
      ads: ads,
      title: "Accueil"
    });
  } catch (error) {
    res.render("error.html", {
      error: error
    });
  }
});

app.get("/annonce", recaptcha.middleware.render, (req, res) => {
  res.render("create.html", {
    captcha: res.recaptcha,
    title: "Ajouter une annonce",
    breadcrumb: req.breadcrumb
  });
});

app.get("/annonce/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const connection = await odbc.connect(process.env.CONNECTION);
    const ads = await connection.query(`SELECT IDFichesSaisies, TypeAnimal, CAST(Commentaires AS VARCHAR(8000)) AS Commentaires, DATE, Heure, TYPE, SiFourriere, SiRetrouve FROM FichesSaisies WHERE IDFichesSaisies = ${id}`);

    res.render("ad.html", {
      ad: ads[0],
      title: "annonce",
      breadcrumb: req.breadcrumb
    });
  } catch (error) {
    res.render("error.html", {
      error: error
    });
  }
});

app.get("/annonces", async (req, res) => {
  const animalType = req.query.animalType;
  const adType = req.query.adType;

  try {
    const connection = await odbc.connect(process.env.CONNECTION);
    const ads = await connection.query(`SELECT IDFichesSaisies, TypeAnimal, CAST(Commentaires AS VARCHAR(8000)) AS Commentaires, DATE, Heure, TYPE FROM FichesSaisies ${adType ? `WHERE TYPE = '${adType}'` : ""} ORDER BY Date DESC LIMIT 12`);

    res.render("ads.html", {
      ads: ads,
      title: "Annonces",
      breadcrumb: req.breadcrumb
    });
  } catch (error) {
    res.render("error.html", {
      error: error
    });
  }
});

app.get("/api/annonces", async (req, res) => {
  const animalType = req.body.animalType;
  const adType = req.body.adType;

  try {
    const connection = await odbc.connect(process.env.CONNECTION);
    const ads = await connection.query(`SELECT IDFichesSaisies, TypeAnimal, CAST(Commentaires AS VARCHAR(8000)) AS Commentaires, DATE, Heure, TYPE FROM FichesSaisies ${adType ? `WHERE TYPE = '${adType}'` : ""} ORDER BY Date DESC LIMIT 12`);

    res.json({
      ads: ads
    });
  } catch (error) {
    res.render("error.html", {
      error: error,
      breadcrumb: req.breadcrumb
    });
  }
});

app.post("/api/annonce", async (req, res) => {
  //const client = new ftp.Client();
  const adType = req.body.adType;
  const animalType = req.body.animalType;
  const commentaires = req.body.commentaires;
  const fileName = 'image-' + Date.now();
  const file = req.files;

  try {
    
    fs.writeFile('upload.txt', `
      AdType: ${adType},
      AnimalType: ${animalType},
      Commentaires: ${commentaires}
      File: ${fileName}
    `, { flag: 'w' }, err => {});

    await client.access({
        host: "",
        user: "",
        password: "",
        secure: true
    });

    await client.uploadFrom(file, "annonces/" + fileName);
    await client.uploadFrom("upload.txt", "annonces/upload.txt");

    res.send(200);
  } catch (error) {
    res.send(400);
  }
});

app.post("/api/contact", recaptcha.middleware.verify, async (req, res) => {
  const message = req.body.message;
  if (!req.recaptcha.error) {
    try {
      const connection = await odbc.connect(process.env.CONNECTION);
      const ad = await connection.query(`INSERT INTO NousContacter (Message) VALUES ('${message}')`);

      res.send(200);
    } catch (error) {
      res.json({
        error: error
      });
    }
  } else {
    res.json({
      error: req.recaptcha.error
    });
  }
});

app.post("/api/comments", async (req, res) => {
  const commentaires = req.body.commentaires;

  res.json({
    commentaires: commentaires
  });
});

app.get("/contact", recaptcha.middleware.render, (req, res) => {
  res.render("contact.html", {
    title: "Contact",
    breadcrumb: req.breadcrumb,
    captcha: res.recaptcha
  });
});

app.get("/conseils", (req, res) => {
  res.render("advises.html", {
    title: "Conseils",
    breadcrumb: req.breadcrumb
  });
});

app.get("/partenaires", async (req, res) => {
  try {
    const connection = await odbc.connect(process.env.CONNECTION);
    const parteners = await connection.query(`SELECT IDPartenaires, Nom, LienWeb, NbImages FROM Partenaires WHERE TYPE = 'PARTENAIRE'`);

    res.render("partners.html", {
      parteners: parteners,
      title: "Partenaires",
      breadcrumb: req.breadcrumb
    });
  } catch (error) {
    res.render("error.html", {
      error: error
    });
  }
});

app.get("/jeux", async (req, res) => {
  res.render("game.html", {
    title: "Jeux",
    breadcrumb: req.breadcrumb
  });

});

app.get("/monde-animal", async (req, res) => {
  try {
    const connection = await odbc.connect(process.env.CONNECTION);
    const animals = await connection.query(`SELECT IDPartenaires, Nom, LienWeb, NbImages FROM Partenaires WHERE TYPE = 'DONS'`);

    res.render("animal.html", {
      animals: animals,
      title: "Monde Animale",
      breadcrumb: req.breadcrumb
    });
  } catch (error) {
    res.render("error.html", {
      error: error
    });
  }
});

app.get("/mentions-legales", (req, res) => {
  res.render("mentions.html", {
    title: "Mentions legales",
    breadcrumb: req.breadcrumb
  });
});

app.get("/tutoriel", (req, res) => {
  res.render("tutoriel.html", {
    breadcrumb: req.breadcrumb
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});


