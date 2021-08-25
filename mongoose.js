const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

const Schema = mongoose.Schema;

const IssueSchema = new Schema({
  project: { type: String, required: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_on: Date,
  updated_on: Date,
  created_by: { type: String, required: true },
  assigned_to: String,
  open: Boolean,
  status_text: String
});

const Issue = mongoose.model('Issue', IssueSchema);

// console.log(`Issue`, Issue); // DEBUG

module.exports = {
  Issue
};
