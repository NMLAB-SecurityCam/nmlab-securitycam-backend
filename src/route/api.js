import dotenv from 'dotenv-defaults';
import express from 'express';
import cors from 'cors';
import Users from '../Users';
import { client } from '../client';
dotenv.config();

// router initialization
const router = express.Router();
// middlewares
router.use(cors());
router.use(express.json());
router.use(
  express.urlencoded({
    extended: true,
  })
);

// for our camera services
// payload {"id": "LineID", img_url: "https://..."}
router.post('/alert', async (req, res) => {
  const userObj = await Users.findById(req.body.id);
  if (userObj?.userId) {
    const alertMsg = {
      type: 'text',
      text: '$ Alert detected! $',
      emojis: [
        {
          index: 0,
          productId: '5ac21cc5031a6752fb806d5c',
          emojiId: '003',
        },
        {
          index: 18,
          productId: '5ac21cc5031a6752fb806d5c',
          emojiId: '004',
        },
      ],
    };
    await client.pushMessage(userObj.userId, alertMsg);
    await client.pushMessage(userObj.userId, {
      type: 'image',
      originalContentUrl: req.body.img_url,
      previewImageUrl: req.body.img_url,
    });
    res.status(200).send({ message: 'Message forwarded successfully!' });
  } else {
    res.status(400).send({ message: 'UserID not found. Either the user does not exist or user does not register and activate this feature.' });
  }
});

router.post('/snapshot', async (req, res) => {
  const userObj = await Users.findById(req.body.id);
  if (userObj?.userId) {
    await client.pushMessage(userObj.userId, {
      type: 'image',
      originalContentUrl: req.body.img_url,
      previewImageUrl: req.body.img_url,
    });
    res.status(200).send({ message: 'Snapshot forwarded successfully!' });
  } else {
    res.status(400).send({ message: 'UserID not found. Either the user does not exist or user does not register and activate this feature.' });
  }
});

export default router;
