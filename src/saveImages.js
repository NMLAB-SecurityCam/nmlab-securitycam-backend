import AWS from 'aws-sdk';
import dotenv from 'dotenv-defaults';


async function saveImages(content) {

    dotenv.config();

    const s3 = new AWS.S3({
        accessKeyId: process.env.s3_access_key,
        secretAccessKey: process.env.s3_secret_access_key,
    });
    console.log("uploading to s3 bucket...");

    const uploadImage = await s3.upload({
        Bucket: process.env.s3_bucket_name,
        Key: `photo_${Date.now()}`,
        Body: content,
    }).promise();

    console.log(uploadImage.Location);
    return uploadImage.Location;
}

export default saveImages;