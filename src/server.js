import express from "express";
import https from "https";
import cors from "cors";
import * as line from "@line/bot-sdk";
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
      handleEvent(e, client);
    })
  ).then((result) => res.json(result));
});

function handleEvent(event, client) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  /*
      implement response logic here,
      currently, just echo back the message
  */

  return client.replyMessage(event.replyToken, [
    {
      type: "text",
      text: event.message.text,
    },
  ]);
}

// app.post("/webhook", line.middleware(LineSDKConfig), function (req, res) {
//   res.status(200).send("HTTP POST request sent to the webhook URL!");
//   // If the user sends a message to your bot, send a reply message
//   // console.log(req.body);
//   if (req.body.events?.[0].type === "message") {
//     // Message data, must be stringified
//     const dataString = JSON.stringify({
//       replyToken: req.body.events[0].replyToken,
//       messages: [
//         {
//           type: "text",
//           text: "Hello, user",
//         },
//         {
//           type: "text",
//           text: "May I help you?",
//         },
//       ],
//     });

//     // Request header
//     const headers = {
//       "Content-Type": "application/json",
//       Authorization: "Bearer " + LineSDKConfig.channelAccessToken,
//     };

//     // Options to pass into the request
//     const webhookOptions = {
//       hostname: "api.line.me",
//       path: "/v2/bot/message/reply",
//       method: "POST",
//       headers: headers,
//       body: dataString,
//     };

//     // Define request
//     const request = https.request(webhookOptions, (res) => {
//       res.on("data", (d) => {
//         process.stdout.write(d);
//       });
//     });

//     // Handle error
//     request.on("error", (err) => {
//       console.error(err);
//     });

//     // Send data
//     request.write(dataString);
//     request.end();
//   }
// });

app.listen(process.env.PORT || 5000, () => {
  console.log(`App listening at http://localhost:${process.env.PORT || 5000}`);
});
