import 'core-js/stable';
import 'regenerator-runtime/runtime';
import express from 'express';
import https from 'https';
import cors from 'cors';
import * as line from '@line/bot-sdk';
import webhookHandler from './webhookHandler';
import Users from './Users';
import dotenv from 'dotenv-defaults';
import mongoose from 'mongoose';
dotenv.config();

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(res => console.log('MongoDB connection created'))
  .catch(err => console.log(`MongoDB connection failed`));

const LineSDKConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const client = new line.Client(LineSDKConfig);

const app = express();
if (process.env.MODE === 'prod') {
  app.use(line.middleware(LineSDKConfig));
}
app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// for health check
app.get('/', (req, res) => {
  res.status(200).send('health check passed!');
});

// for line webhook (response to events)
app.post('/webhook', (req, res) => {
  Promise.all(
    req.body.events.map(e => {
      webhookHandler(e, client);
    })
  ).then(result => res.json(result));
});

// for our camera services
// payload {"id": "LineID", img_url: "https://..."}
app.post('/alert', async (req, res) => {
  const userObj = await Users.findById(req.body.id);
  if (userObj?.userId) {
    const alertMsg = {
      type: 'text',
      text: '$ Alert detected! $',
      emojis: [
        {
          index: 0,
          productId: '5ac21cc5031a6752fb806d5c',
          emojiId: '003',
        },
        {
          index: 18,
          productId: '5ac21cc5031a6752fb806d5c',
          emojiId: '004',
        },
      ],
    };
    await client.pushMessage(userObj.userId, alertMsg);
    await client.pushMessage(userObj.userId, {
      type: 'image',
      originalContentUrl: req.body.img_url,
      previewImageUrl: req.body.img_url,
    });
    res.status(200).send({ message: 'Message forwarded successfully!' });
  } else {
    res.status(400).send({ message: 'UserID not found. Either the user does not exist or user does not register and activate this feature.' });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`App listening at ${process.env.MODE === 'prod' ? 'https://nmlab-securitycam.herokuapp.com' : 'localhost'}:${process.env.PORT || 5000}`);
});
