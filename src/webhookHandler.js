import Users from './Users';
import { mqtt_publisher, publish, mqtt_topic } from './mqtt_client';

const mock_up_img_url = 'https://nmlab-final-securitycam.s3.ap-northeast-1.amazonaws.com/img-1653129955256.png';

const webhookHandler = async (event, client) => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // setup lineID
  if (event.type === 'message' && event.message.text.slice(0, 4) === '!id:') {
    // register a [lineID, userId] user obj to DB's collection
    let lineId = event.message.text.split(':')?.[1] ?? '';
    if (lineId !== '' || lineId.trim() !== '') {
      lineId = lineId.trim();
      const userObj = await Users.findById(lineId);
      if (userObj) {
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: `Your LineId has registered already.`,
        });
      } else {
        const newUserObj = new Users({
          _id: lineId,
          userId: event.source.userId,
          streamingKey: null,
        });
        try {
          await Users.deleteMany({ userId: event.source.userId });
          await newUserObj.save();
          return client.replyMessage(event.replyToken, [
            {
              type: 'text',
              text: 'Initialize success :)',
            },
          ]);
        } catch (err) {
          console.log(err);
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: `Error when registering!`,
          });
        }
      }
    } else {
      return client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: 'Invalid format, please try again. Valid format:\n !id: MY_LINEID',
        },
      ]);
    }
  }

  // setup yt streaming key
  if (event.type === 'message' && event.message.text.split(':')?.[0] === '!streaming_key') {
    const userObj = await Users.findOne({ userId: event.source.userId });
    const streamingKey = event.message.text.split(':')?.[1] ?? '';
    if (userObj) {
      if (streamingKey !== '' || streamingKey.trim() !== '') {
        try {
          await Users.updateOne({ _id: userObj._id }, { streamingKey: streamingKey });
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: 'Update streaming key successfully!',
          });
        } catch {
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: 'Error when updating streaming key, try again or contact us.',
          });
        }
      } else {
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'Invalid streaming key!',
        });
      }
    } else {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'You have not registered yet, please register first.',
      });
    }
  }

  // snapshot
  if (event.type === 'message' && event.message.text.trim() === '!snapshot') {
    const userObj = await Users.findOne({ userId: event.source.userId });
    if (userObj?.userId) {
      // can do requets to ask the machine to take pics and save it in s3 and transfer it back here
      publish(mqtt_publisher, mqtt_topic, { command: 'snapshot' });
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'Here is your snapshot.',
      });
    } else {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'You have not registered yet, please register first.',
      });
    }
  }

  // enable or disable alert
  if (event.type === 'message' && event.message.text.slice(0, 7) === '!alert:') {
    if ((event.message.text.split(':')?.[1] ?? '').trim() === '1') {
      publish(mqtt_publisher, mqtt_topic, { command: 'alert', enable: true });
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'Enable alert feature.',
      });
    } else if ((event.message.text.split(':')?.[1] ?? '').trim() === '0') {
      publish(mqtt_publisher, mqtt_topic, { command: 'alert', enable: false });
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'Disable alert feature.',
      });
    }
  }

  // start streaming or stop streaming
  if (event.type === 'message' && event.message.text.slice(0, 8) === '!stream:') {
    if ((event.message.text.split(':')?.[1] ?? '').trim() === '1') {
      const userObj = await Users.findOne({ userId: event.source.userId });
      if (userObj?.streamingKey) {
        publish(mqtt_publisher, mqtt_topic, { command: 'stream_on', stream_key: userObj.streamingKey });
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'Start streaming.',
        });
      } else {
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'Type !streaming_key: YOUR_STREAMING_KEY to enable streaming.',
        });
      }
    } else if ((event.message.text.split(':')?.[1] ?? '').trim() === '0') {
      publish(mqtt_publisher, mqtt_topic, { command: 'stream_off' });
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'Stop streaming.',
      });
    }
  }

  /*
    implement response logic here,
    currently, just echo back the message
     */
  if (event?.source?.hasOwnProperty('groupId')) {
    // in group chat
    console.log('source groupId: ', event.source.groupId);
  } else if (event?.source?.hasOwnProperty('roomId')) {
    // in nulti-person chat
    console.log('source roomId: ', event.source.roomId);
  } else {
    // in single person chat
    console.log('source userId: ', event.source.userId);
  }

  return client.replyMessage(event.replyToken, [
    {
      type: 'text',
      text: event.message.text,
    },
    {
      type: 'text',
      text: 'stfu',
    },
  ]);
};

export default webhookHandler;
