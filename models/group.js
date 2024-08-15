
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  isPersonal: {
    type: Boolean,
    default: false
  },
  users: [{
    type: String
  }]

});
groupSchema.pre('save', function(next) {
  if (this.isPersonal && this.users.length > 2) {
    return next(new Error('Personal group can only have up to two users.'));
  }
  next();
});



const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
