require("dotenv").config();
const { validateMovie, validateUser } = require("./validators.js");
const express = require("express");

const app = express();

app.use(express.json());

const {
  hashPassword,
  verifyPassword,
  verifyToken,
  verifyid,
} = require("./auth.js");

const userHandlers = require("./userHandlers");
const {
  getUsers,
  getUserById,
  getUserByEmailWithPasswordAndPassToNext,
  postUser,
  updateUser,
  deleteUser,
} = require("./userHandlers");

const movieHandlers = require("./movieHandlers");

const welcome = (req, res) => {
  res.send("Welcome to my favourite movie list");
};

// the public routes
app.get("/", welcome);
app.post(
  "/api/login",
  userHandlers.getUserByEmailWithPasswordAndPassToNext,
  verifyPassword
);

app.post("/api/users", hashPassword, userHandlers.postUser);
app.get("/api/movies", movieHandlers.getMovies);
app.get("/api/movies/:id", movieHandlers.getMovieById);
app.get("/api/users", userHandlers.getUsers);
app.get("/api/users/:id", userHandlers.getUserById);

// the routes to protect
app.use(verifyToken);

app.post("/api/movies", validateMovie, verifyToken, movieHandlers.postMovie);
app.put("/api/movies/:id", validateMovie, movieHandlers.updateMovie);
app.delete("/api/movies/:id", movieHandlers.deleteMovie);

app.put(
  "/api/users/:id",
  verifyid,
  validateUser,
  userHandlers.updateUser,
  hashPassword
);
app.delete("/api/users/:id", verifyid, userHandlers.deleteUser);

const port = process.env.APP_PORT ?? 5000;

app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});

module.exports = {
  getUsers,
  getUserById,
  getUserByEmailWithPasswordAndPassToNext,
  verifyPassword,
  verifyToken,
  postUser,
  updateUser,
  deleteUser,
};
