require("dotenv").config();

const sassMiddleware = require("node-sass-middleware");
const bodyParser = require("body-parser");
const nunjucks = require("nunjucks");
const express = require("express");
const path = require("path");
// const odbc = require("odbc");
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

app.set("view engine", "html");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// HOME
app.get("/", async (req, res) => {
  res.render("home.html");
});

app.get("/annonces", async (req, res) => {
  const ads = [
    {
      title: "Chien Marron",
      description:
        "Petit chien marron, perdu pas très loin de la piscine de koutio. Merci de me contacter au 000000",
      image:
        "url(https://lh3.googleusercontent.com/proxy/sLdn2n6aMvD6vm1Qhfvvmfm6i3Zis38m5sxdUoKdnK85yCovyvIXLhxes7TnlA8q9v5dcY0OIzttD4LIfWrVCxXE_0YXglvujkKLFOhq-l-ZbixlWN_R0wzdz7yj9YMCgSj_-S6MZOJmvMtogbVS33_qjh9_syPPl33xEJeSps_fgnH1GFUkGxEijIVKqPmYEEeTNMdh)"
    },
    {
      title: "Chat Gris",
      description:
        "Petit chat gris, perdu à Magenta pas très loin du stage de Magenta",
      image:
        "url(https://lemagduchat.ouest-france.fr/images/dossiers/2020-01/korat-073252.jpg)"
    },
    {
      title: "Chat blanc, avec des tâches grise",
      description:
        "Petit chat blanc avec des petites tâches gris, perdu dans le quartier de rivière salée",
      image:
        "url(https://vignette.wikia.nocookie.net/les-chats-sauvages/images/2/22/Taches_Grises.jpg/revision/latest/top-crop/width/360/height/450?cb=20180626165248&path-prefix=fr)"
    },
    {
      title: "Petit chien brun",
      description: "Petit chien brun perdu, dans le quartien de ducos",
      image:
        "url(https://media.ooreka.fr/public/image/3-309193-6227-main-13551391.jpg)"
    },
    {
      title: "Chat Marron",
      description: "Petit chat marron, perdu dans le quartie du Mont-dore",
      image:
        "https://www.toutpourmonchat.fr/wp-content/uploads/2013/01/chat-chocolat.jpg"
    },
    {
      title: "Chien blanc",
      description: "Chien blanc perdu dans nouméa",
      image:
        "https://jardinage.lemonde.fr/images/dossiers/2018-03/montagne-des-pyrenees-140645.jpg"
    }
  ];

  res.render("ads.html", {
    ads: ads
  });
});

app.get("/add-post", async(req, res) => {
  res.render("add-post.html");
});

app.post("/annonce", (req, res) => {
  const title = req.body.title;
  const animal = req.body.animal;
  const situation = req.body.situation;
  const sexe = res.body.sexe;
  const age = res.body.age;
  const description = req.body.description;

  const ad = {
    title: title,
    animal: animal,
    situation: situation,
    sexe: sexe,
    age: age,
    description: description,
  };

  res.json(ad);
});

app.get("/contact", async (req, res) => {
  res.render("contact.html");
});

app.post("/contact", (req, res) => {
  const nom = req.body.nom;
  const prenom = req.body.prenom;
  const mail = req.body.mail;
  const sujet = req.body.sujet;
  const message = req.body.message;

  const ad = {
    nom: nom,
    prenom: prenom,
    mail: mail,
    sujet: sujet,
    message: message
  };

  res.json(ad);
});

app.get("/design", async (req, res) => {
  res.render("design.html");
});

app.get("/tuto", async (req, res) => {
  res.render("tuto.html");
});

app.get("/partenaires", async (req, res) => {
  res.render("partenaires.html");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
