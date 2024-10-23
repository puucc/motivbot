const { BskyAgent } = require('@atproto/api');
const axios = require('axios');
require('dotenv').config();

const postedImages = new Set();
const agent = new BskyAgent({ service: 'https://bsky.social' });

const image = async () => {
  const res = await axios.get('https://inspirobot.me/api?generate=true');
  const imageUrl = res.data;
  if (!postedImages.has(imageUrl)) {
    postedImages.add(imageUrl);
    return imageUrl;
  }
  return image();
};

const postImage = async (imageUrl) => {
  await agent.login({ identifier: process.env.BSKY_USERNAME, password: process.env.BSKY_PASSWORD });
  const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const blob = await agent.uploadBlob(imgRes.data, { encoding: 'image/jpeg' });
  await agent.post({
    text: '',
    embed: {
      $type: 'app.bsky.embed.images',
      images: [
        {
          image: blob.data.blob,
          alt: 'Motivational image from InspiroBot'
        }
      ]
    }
  });
};

const bot = async () => {
  while (true) {
    const imageUrl = await image();
    await postImage(imageUrl);
    await new Promise(resolve => setTimeout(resolve, 86400000));
  }
};

bot();
