import AWS from 'aws-sdk';
import dotenv from 'dotenv-defaults';

async function saveImages(content) {
  // console.log("in saveImages");
  dotenv.config();

  const s3 = new AWS.S3({
    accessKeyId: process.env.s3_access_key,
    secretAccessKey: process.env.s3_secret_access_key,
  });
  // console.log("uploading...");
  // const response = await axios.get(image_url,  { responseType: 'arraybuffer' });
  // const buffer = Buffer.from(response.data, "utf-8");
  // console.log(buffer);

  const uploadImage = await s3
    .upload({
      Bucket: process.env.s3_bucket_name,
      Key: `photo_${Date.now()}.jpg`,
      Body: content,
    })
    .promise();

  // console.log(uploadImage.Location);
  return uploadImage.Location;
}

export default saveImages;
