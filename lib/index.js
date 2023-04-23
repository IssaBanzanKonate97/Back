import express from "express";
import { Auth } from "./services/Auth";
const app = express();
const port = 8080;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`SERVEUR LANCÉ SUR LE PORT : ${port}`);
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("user", user);
    console.log("password", password);

    const auth = new Auth();

    await auth.loginUser();
  } catch (error) {
    res.status(402);
  }
});
