import 'core-js/stable';
import 'regenerator-runtime/runtime';
import express from 'express';
import https from 'https';
import cors from 'cors';
import * as line from '@line/bot-sdk';
import webhookHandler from './webhookHandler';
import Users from './Users';
import pushMessages from './pushMessages';
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
// should be sent with LineId
// try type $curl -X POST http://localhost:5000/alert -H 'Content-Type:application/json' -d '{"id": "theLindIDYouWantToSendMsgTo"}'
app.post('/alert', async(req, res) => {
  console.log(typeof(req.body.id));
  console.log(req.body.id);
  const userObj = await Users.findById(req.body.id);
  // console.log(userObj);
  pushMessages(userObj.userId);
  res.json("{data: passed}");
});

// app.post('/snapshot', (req, res) => {
//   console.log(req.body);
//   console.log("hi snapshot");
// })

app.listen(process.env.PORT || 5000, () => {
  console.log(`App listening at http://localhost:${process.env.PORT || 5000}`);
});
