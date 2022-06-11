const line = require('@line/bot-sdk');
import dotenv from 'dotenv-defaults';

function pushMessages(user_id) {

    dotenv.config();

    const client = new line.Client({
        channelAccessToken: process.env.LINE_ACCESS_TOKEN
    });

    const message = {
        type: 'text',
        text: 'Hello World!'
    };

    const message2 = {
        type: 'image',
        originalContentUrl: 'https://nmlab-final-securitycam.s3.ap-northeast-1.amazonaws.com/img-1653129955256.png',
        previewImageUrl: 'https://nmlab-final-securitycam.s3.ap-northeast-1.amazonaws.com/img-1653129955256.png',
    }

    // change to message2 if you want to see my face :D
    client.pushMessage(user_id, message2)
    .then(() => {
    })
    .catch((err) => {
    print("err")
    });
}

export default pushMessages