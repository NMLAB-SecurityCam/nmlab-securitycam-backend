import express from "express";
import https from "https";
import cors from "cors";
import * as line from "@line/bot-sdk";
import webhookHandler from "./webhookHandler";
import dotenv from "dotenv-defaults";
dotenv.config();

const LineSDKConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const client = new line.Client(LineSDKConfig);

const app = express();
app.use(cors());
// app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.status(200).send("health check passed!");
});

app.post("/webhook", line.middleware(LineSDKConfig), (req, res) => {
  Promise.all(
    req.body.events.map((e) => {
      webhookHandler(e, client);
    })
  ).then((result) => res.json(result));
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`App listening at http://localhost:${process.env.PORT || 5000}`);
});
