import * as grpc from 'grpc';
// import protoLoader from "@grpc/proto-loader"
const PROTO_PATH = __dirname + '/video.proto';

// const VideoProcessor = grpc.load(PROTO_PATH).VideoProcessor;

// const grpc_client = new VideoProcessor('192.168.55.1:8080', grpc.credentials.createInsecure());
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {keepCase: true,
   longs: String,
   enums: String,
   defaults: true,
   oneofs: true
  });
var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
// The protoDescriptor object has the full package hierarchy
console.log(protoDescriptor)
var routeguide = protoDescriptor.VideoProcessor;
console.log(routeguide)

const grpc_client = new routeguide('192.168.55.1:8080', grpc.credentials.createInsecure());


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
