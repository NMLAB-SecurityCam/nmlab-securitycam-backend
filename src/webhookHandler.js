import mongoose from 'mongoose';
import Users from './Users';

const webhookHandler = async (event, client) => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // trigger when typing `!id: ...`
  if (event.type === 'message' && event.message.text.slice(0, 4) === '!id:') {
    // register a [lineID, userId] user obj to DB's collection
    const lineId = event.message.text.split(':')?.[1] ?? '';
    if (lineId !== '' || lineId.trim() === '') {
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
    {
      type: 'text',
      text: '你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹',
    },
    {
      type: 'text',
      text: '太神啦',
    },
  ]);
};

export default webhookHandler;
