import mongoose from 'mongoose';
const users = new mongoose.Schema({
  _id: String, // Unique LineID
  userId: String, // Line UserId used for API
});

const Users = mongoose.model('UserIds', users);

export default Users;
