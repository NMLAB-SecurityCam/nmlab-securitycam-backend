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
    const new_images = userObj?.images ?? [];
    new_images.push({
      url: req.body.img_url,
      timestamp: new Date().toISOString(),
      image_type: 'alert',
    });
    await Users.findByIdAndUpdate(req.body.id, { images: new_images });
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
    const new_images = userObj?.images ?? [];
    new_images.push({
      url: req.body.img_url,
      timestamp: new Date().toISOString(),
      image_type: 'snapshot',
    });
    await Users.findByIdAndUpdate(req.body.id, { images: new_images });
    res.status(200).send({ message: 'Snapshot forwarded successfully!' });
  } else {
    res.status(400).send({ message: 'UserID not found. Either the user does not exist or user does not register and activate this feature.' });
  }
});

router.post('/whitelist', async (req, res) => {
  const userObj = await Users.findById(req.body.id);
  if (userObj?.userId) {
    res.status(200).send({ whitelist: userObj.whitelist });
  } else {
    res.status(404).send({ whitelist: null });
  }
});

router.post('/user', async (req, res) => {
  try {
    const targetUser = await Users.findOne({ auth0Id: req.body.user });
    if (!targetUser) {
      console.log('sent!');
      res.status(200).send({ user: null });
    } else {
      console.log('sent!');
      res.status(200).send({ user: targetUser });
    }
  } catch (e) {
    res.status(400).send({ message: 'Error occur' });
  }
});

router.post('/create_user', async (req, res) => {
  try {
    const userObj = await Users.findById(req.body.id);
    if (!userObj) {
      // create a user
      const newUserObj = new Users({
        _id: lineId,
        userId: null,
        streamingKey: null,
        whitelist: [],
        auth0Id: req.body.auth0Id,
      });
      try {
        await newUserObj.save();
        res.status(200).send({ success: true });
      } catch (e) {
        res.status(400).send({ success: false });
      }
    } else {
      //already exists
      // update user, add auth0Id field
      try {
        await Users.findByIdAndUpdate(req.body.id, {
          auth0Id: req.body.auth0Id,
        });
        res.status(200).send({ success: true });
      } catch (e) {
        res.status(400).send({ success: false });
      }
    }
  } catch (e) {
    res.status(400).send({ message: 'Error occur' });
  }
});

export default router;
