'use strict';

const { Issue } = require('../mongoose.js');

// console.log(`Issue`, Issue); // DEBUG

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      const find = Object.assign({ project }, req.query)
      Issue.find(find)
           .select('-project -__v')
           .exec((error, issues) => {
             res.json(issues);
           });
    })
    
    .post(function (req, res){
      let project = req.params.project;

      // console.log(`app.route('/api/issues/:project').post()::req.body`, req.body); // DEBUG
      const { issue_title, issue_text, created_by } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        return res.json({
          error: 'required field(s) missing'
        });
      }

      const issue = new Issue({
        project,
        issue_title,
        issue_text,
        created_by
      });
      issue.created_on = new Date();
      issue.updated_on = new Date();
      issue.assigned_to = req.body.assigned_to !== undefined ? req.body.assigned_to : '';
      issue.open = true;
      issue.status_text = req.body.status_text !== undefined ? req.body.status_text : '';

      // console.log(`app.route('/api/issues/:project').post()::issue`, issue); // DEBUG

      issue.save(err => {
        if (!err) {
          issue.project = undefined;
          issue.__v = undefined;
          res.json(issue);
        }
      });
    })
    
    .put(function (req, res){
      let project = req.params.project;
      // console.log(`req.body`, req.body); // DEBUG
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      const $set = {};
      if (issue_title) $set.issue_title = issue_title;
      if (issue_text) $set.issue_text = issue_text;
      if (created_by) $set.created_by = created_by;
      if (assigned_to) $set.assigned_to = assigned_to;
      if (status_text) $set.status_text = status_text;
      if (open) $set.open = open; // QUESTION Use string ?
      if (Object.keys($set).length === 0) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }
      $set.updated_on = new Date();

      Issue.findOneAndUpdate({ _id }, { $set }, { new: true }, (error, issue) => {
        // console.log(`issue`, issue); // DEBUG
        if (error || !issue) {
          res.json({ error: 'could not update', '_id': _id });
        } else {
          res.json({
            result: 'successfully updated',
            '_id': _id
          })
        }
      });
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      const { _id } = req.body;
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      Issue.findOneAndDelete({ _id }, (error, issue) => {
        if (error || !issue) {
          res.json({ error: 'could not delete', '_id': _id });
        } else {
          res.json({ result: 'successfully deleted', '_id': _id });
        }
      })
    });
    
};
