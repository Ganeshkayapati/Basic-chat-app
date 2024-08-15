
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  isPersonal: {
    type: Boolean,
    default: false
  }
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
