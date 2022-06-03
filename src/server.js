import 'core-js/stable';
import 'regenerator-runtime/runtime';
import express from 'express';
import * as line from '@line/bot-sdk';
import webhookHandler from './webhookHandler';
import dotenv from 'dotenv-defaults';
import mongoose from 'mongoose';
import { client, LineSDKConfig } from './client';
import custom_api_router from './route/api';
dotenv.config();

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(res => console.log('MongoDB connection created'))
  .catch(err => console.log(`MongoDB connection failed`));

const app = express();
app.use('/api', custom_api_router);

// for health check
app.get('/', (req, res) => {
  res.status(200).send('health check passed!');
});

// for line webhook (response to events)
app.post('/webhook', line.middleware(LineSDKConfig), (req, res) => {
  console.log('req: ', req);
  Promise.all(
    req.body.events.map(e => {
      webhookHandler(e, client);
    })
  ).then(result => res.json(result));
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`App listening at ${process.env.MODE === 'prod' ? 'https://nmlab-securitycam.herokuapp.com' : 'localhost'}:${process.env.PORT || 5000}`);
});
