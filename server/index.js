const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const User = require("./models/user");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("connected");
});

app.post("/users/create", async (req, res) => {
  const { username, email, password, post } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = User.create({
    username,
    email,
    password: hashPassword,
    post,
  });
  const saveNewUser = await (await newUser).save();
  res.json(saveNewUser);
});

app.get("/users/:userId", async (req, res) => {
  try {
    const singleUser = await User.findOne({ _id: req.params.userId });
    res.send(singleUser);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/login", async (req, res) => {
  const { password, username } = req.body;
  const user = await User.findOne({ username: username });
  if (await bcrypt.compare(password, user?.password)) {
    res.json({ message: "Login success", data: user });
  } else {
    res.status(500).send("Wrong username and Password combination");
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Running at port ${process.env.PORT}`);
});
