import mongoose from 'mongoose';
const users = new mongoose.Schema({
  _id: String, // Unique LineID
  userId: String, // Line UserId used for API
  streamingKey: String,
  whitelist: [String],
  // snapshot: [...Image],
  // alert: [...Image],
  // device: [`255.255.255.255:3000`, `123.123.123.123:3000`],
});

// const image = new mongoose.Schema({
// to: String, // User LineID
// url: String,
// timestamp: timestamptz (ISO 8601),
// })

const Users = mongoose.model('UserIds', users);

export default Users;
