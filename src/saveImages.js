import AWS from 'aws-sdk';
import dotenv from 'dotenv-defaults';
import axios from 'axios';


async function saveImages(image_url) {

    dotenv.config();

    const s3 = new AWS.S3({
        accessKeyId: process.env.s3_access_key,
        secretAccessKey: process.env.s3_secret_access_key,
    });

    const response = await axios.get(image_url,  { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, "utf-8");
    // res = await fetch(image_url);
    console.log(buffer);
    // http.get(image_url, res =>{

    // })
    // const fileContent = fs.readFileSync(image_url);

    const uploadImage = await s3.upload({
        Bucket: process.env.s3_bucket_name,
        Key: `photo_${Date.now}`,
        Body: buffer,
    }).promise();

    console.log(uploadImage.Location);
    return uploadImage.Location;
}

export default saveImages;