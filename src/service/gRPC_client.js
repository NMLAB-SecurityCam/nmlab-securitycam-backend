import * as grpc from 'grpc';
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = 'src/service/video.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
var routeguide = protoDescriptor.VideoProcessor;
const grpc_client = new routeguide('101.12.54.161:8080', grpc.credentials.createInsecure());

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
