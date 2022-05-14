// webhookHandler

const webhookHandler = (event, client) => {
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
    {
      type: "text",
      text: "stfu",
    },
    {
      type: "text",
      text: "你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹你從桃園新竹",
    },
    {
      type: "text",
      text: "太神啦",
    },
  ]);
};

export default webhookHandler;
