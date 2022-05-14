// webhookHandler

const webhookHandler = (event, client) => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
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
