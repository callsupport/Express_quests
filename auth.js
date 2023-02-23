const argon2 = require("argon2");
const { getUserByEmail } = require("./userHandlers");
const jwt = require("jsonwebtoken");

const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
};

const hashPassword = (req, res, next) => {
  if (!req.body.password) {
    return res.status(400).send("Password is missing");
  }
  argon2
    .hash(req.body.password, hashingOptions)
    .then((hashedPassword) => {
      //console.log(hashedPassword);//

      req.body.hashedPassword = hashedPassword;
      delete req.body.password;

      next();
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const verifyPassword = (req, res) => {
  argon2
    .verify(req.user.hashedPassword, req.body.password)
    .then((isVerified) => {
      if (isVerified) {
        const playload = { sub: req.user.id };

        const token = jwt.sign(playload, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        delete req.user.hashedPassword;
        res.send({ token, user: req.user });
      } else {
        res.sendStatus(401);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

function verifyToken(req, res, next) {
  try {
    const authorizationHeader = req.get("Authorization");
    if (authorizationHeader == null) {
      throw new Error("Authorization header is missing");
    }

    const [type, token] = authorizationHeader.split(" ");
    if (type !== "Bearer") {
      throw new Error("Authorization header has not the 'Bearer' token");
    }

    req.playload = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(401);
  }
}
//Vérifie que l'id de l'utilisateur correspond au payload du token
function verifyid(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (id !== req.playload.sub) {
      return res.status(403).send("Forbidden");
    }
    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(401);
  }
}

module.exports = {
  hashPassword,
  hashingOptions,
  verifyPassword,
  verifyToken,
  verifyid,
};
