import Users from './Users';
import { grpc_client, getImageUrl } from './service/gRPC_client';

const mock_up_img_url = 'https://nmlab-final-securitycam.s3.ap-northeast-1.amazonaws.com/img-1653129955256.png';

const webhookHandler = async (event, client) => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // trigger when typing `!id: ...`
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
        });
        try {
          await newUserObj.save();
          return client.replyMessage(event.replyToken, [
            {
              type: 'text',
              text: 'Success :)',
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

  // snapshot
  if (event.type === 'message' && event.message.text === '!snapshot') {
    const userObj = await Users.findOne({ userId: event.source.userId });
    if (userObj?.userId) {
      // can do requets to ask the machine to take pics and save it in s3 and transfer it back here
      // use getImageUrl() to get the url
      const img_url = await getImageUrl(grpc_client);
      console.log('img_url: ', img_url);
      await client.pushMessage(userObj.userId, {
        type: 'image',
        originalContentUrl: mock_up_img_url,
        previewImageUrl: mock_up_img_url,
      });
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'Here is you snapshot.',
      });
    } else {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'You have not registered yet, please register first.',
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
