import Users from './Users';
import WhitelistBuffers from './Whitelist';
import { mqtt_publisher, publish, mqtt_topic } from './mqtt_client';
import saveImages from './saveImages';

const mock_up_img_url = 'https://nmlab-final-securitycam.s3.ap-northeast-1.amazonaws.com/img-1653129955256.png';

const webhookHandler = async (event, client) => {
  // if you still want to keep this, take off the event.message.type !== 'text' condition.
  // if (event.type !== 'message' || event.message.type !== 'text') {
  // return Promise.resolve(null);
  // }

  // setup lineID
  if (event.message.type === 'text' && event.message.text.slice(0, 4) === '!id:') {
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
          whitelist: [],
          auth0Id: null,
          images: [],
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
  if (event.message.type === 'text' && event.message.text.split(':')?.[0] === '!streaming_key') {
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
  if (event.message.type === 'text' && event.message.text.trim() === '!snapshot') {
    const userObj = await Users.findOne({ userId: event.source.userId });
    if (userObj?.userId) {
      // can do requets to ask the machine to take pics and save it in s3 and transfer it back here
      publish(mqtt_publisher, mqtt_topic, { command: 'snapshot', line_id: userObj?._id ?? '' });
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
  if (event.message.type === 'text' && event.message.text.slice(0, 7) === '!alert:') {
    if ((event.message.text.split(':')?.[1] ?? '').trim() === '1') {
      const userObj = await Users.findOne({ userId: event.source.userId });
      publish(mqtt_publisher, mqtt_topic, { command: 'alert', enable: true, line_id: userObj?._id ?? '' });
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'Enable alert feature.',
      });
    } else if ((event.message.text.split(':')?.[1] ?? '').trim() === '0') {
      const userObj = await Users.findOne({ userId: event.source.userId });
      publish(mqtt_publisher, mqtt_topic, { command: 'alert', enable: false, line_id: userObj?._id ?? '' });
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'Disable alert feature.',
      });
    }
  }

  // start streaming or stop streaming
  if (event.message.type === 'text' && event.message.text.slice(0, 8) === '!stream:') {
    if ((event.message.text.split(':')?.[1] ?? '').trim() === '1') {
      const userObj = await Users.findOne({ userId: event.source.userId });
      if (userObj?.streamingKey) {
        publish(mqtt_publisher, mqtt_topic, { command: 'stream_on', stream_key: userObj.streamingKey, line_id: userObj?._id ?? '' });
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
      const userObj = await Users.findOne({ userId: event.source.userId });
      publish(mqtt_publisher, mqtt_topic, { command: 'stream_off', line_id: userObj?._id ?? '' });
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'Stop streaming.',
      });
    }
  }

  // implement whitelist
  if (event.message.type === 'text' && event.message.text.trim() === '!whitelist') {
    const whitelistObj = await WhitelistBuffers.findById(event.source.userId);
    if (!whitelistObj) {
      const newWhitelistObj = new WhitelistBuffers({
        _id: event.source.userId,
      });
      await newWhitelistObj.save();
    }
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'Please upload photo for whitelist.',
    });
  }

  if (event.message.type === 'image') {
    const whitelistObj = await WhitelistBuffers.findById(event.source.userId);
    if (!whitelistObj) {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'If you want to upload images to whitelist, please type !whitelist first',
      });
    }
    await WhitelistBuffers.deleteMany({ _id: event.source.userId });
    const buffers = [];
    await client.getMessageContent(event.message.id).then(stream => {
      stream.on('data', chunk => {
        buffers.push(chunk);
      });
      stream.on('end', () => {
        const buf = Buffer.concat(buffers);
        saveImages(buf).then(async image_uri => {
          // console.log(image_uri);
          // publish(mqtt_publisher, mqtt_topic, { command: 'whitelist', photo_uri: image_uri });
          try {
            const user = await Users.findOne({ userId: event.source.userId });
            const new_list = [...user.whitelist, image_uri];
            await Users.updateOne({ _id: user._id }, { whitelist: new_list });
          } catch (e) {
            // console.log(e);
            return client.replyMessage(event.replyToken, {
              type: 'text',
              text: 'Failed when setting whitelist, try again or contact us.',
            });
          }
        });
      });
    });
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'Whitelist set.',
    });
  }

  // whitelist on/off
  if (event.message.type === 'text' && event.message.text.slice(0, 11) === '!whitelist:') {
    if ((event.message.text.split(':')?.[1] ?? '').trim() === '1') {
      const userObj = await Users.findOne({ userId: event.source.userId });
      if (userObj) {
        publish(mqtt_publisher, mqtt_topic, { command: 'whitelist_on', line_id: userObj?._id ?? '' });
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'Whitelist ON.',
        });
      } else {
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'Please log in first.',
        });
      }
    } else if ((event.message.text.split(':')?.[1] ?? '').trim() === '0') {
      const userObj = await Users.findOne({ userId: event.source.userId });
      publish(mqtt_publisher, mqtt_topic, { command: 'whitelist_off', line_id: userObj?._id ?? '' });
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'Whitelist OFF.',
      });
    }
  }

  // help message
  if (event.message.type === 'text' && event.message.text.trim() === '!help') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text:
        '1. !id: {username} => Register\n' +
        '2. !streaming_key: {streamingkey} => Set up youtube streaming\n' +
        '3. !snapshot\n => Show current photo\n' +
        '4. !alert: 1/0 => Enable/Disable alert\n' +
        '5. !stream: 1/0 => Enable/Disable streaming\n' +
        '6. !whitelist + send an image => Set whitelist\n' +
        '7. !whitelist: 1/0 => Enable/Disable Whitelist',
    });
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
      // text: event.message.text,
      text: 'Invalid Commands. If you need instructions, type "!help"',
    },
    // {
    //   type: 'text',
    //   text: 'stfu',
    // },
  ]);
};

export default webhookHandler;
