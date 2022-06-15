import mongoose from 'mongoose';

const whitelistBuffer = new mongoose.Schema({
    _id: String, // Line UserId used for API
});

const WhitelistBuffers = mongoose.model('Whitelist_buf', whitelistBuffer);

export default WhitelistBuffers;