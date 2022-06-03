import * as line from '@line/bot-sdk';
import dotenv from 'dotenv-defaults';
dotenv.config();

const LineSDKConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const client = new line.Client(LineSDKConfig);

export { LineSDKConfig, client };
