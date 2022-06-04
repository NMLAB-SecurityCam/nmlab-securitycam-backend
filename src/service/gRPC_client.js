import * as grpc from 'grpc';
const PROTO_PATH = __dirname + '/video.proto';

const VideoProcessor = grpc.load(PROTO_PATH).VideoProcessor;

const grpc_client = new VideoProcessor('192.168.55.1:8080', grpc.credentials.createInsecure());

async function getImageUrl(client) {
  let response = null;
  await client.compute(
    {
      algorithm: 1,
    },
    function (err, res) {
      if (err) {
        // process error
        console.log('err: ', err);
      } else {
        // process feature
        console.log('res: ', res);
        response = res;
      }
    }
  );
  return response;
}

export { grpc_client, getImageUrl };
