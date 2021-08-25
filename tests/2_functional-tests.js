const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const LoremIpsum = require('lorem-ipsum').LoremIpsum;

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

const humanNames = require('human-names');

const _ = require('lodash');

const async = require('async');


// ======================================================================================
// 

suite('Functional Tests', function() {
  // #1
  test('Create an issue with every field: POST request to /api/issues/{project}', done => {
    const testObject = {
      issue_title: lorem.generateWords(Math.ceil(Math.random() * 10)),
      issue_text: lorem.generateParagraphs(Math.ceil(Math.random() * 5)),
      created_by: humanNames.allRandom(),
      assigned_to: humanNames.allRandom(),
      status_text: lorem.generateWords(lorem.generateSentences(1))
    }

    chai.request(server)
        .post('/api/issues/apitest')
        .type('form')
        .send(testObject)
        .end((err, res) => {
          assert.equal(err, null);
          assert.equal(res.status, 200);
          const resObject = JSON.parse(res.text);
          for (const [key, value] of Object.entries(testObject)) {
            assert.equal(resObject[key], value);
          }
          done();
        });
  });

  // #2
  test('Create an issue with only required fields: POST request to /api/issues/{project}', done => {
    const testObject = {
      issue_title: lorem.generateWords(Math.ceil(Math.random() * 10)),
      issue_text: lorem.generateParagraphs(Math.ceil(Math.random() * 5)),
      created_by: humanNames.allRandom()
    }

    chai.request(server)
        .post('/api/issues/apitest')
        .type('form')
        .send(testObject)
        .end((err, res) => {
          assert.equal(err, null);
          assert.equal(res.status, 200);
          const resObject = JSON.parse(res.text);
          for (const [key, value] of Object.entries(testObject)) {
            assert.equal(resObject[key], value);
          }
          done();
        });
  });

  // #3
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', done => {
    const testObject = {
      issue_title: Math.random() >= 0.5 ? lorem.generateWords(Math.ceil(Math.random() * 10)) : undefined,
      issue_text: Math.random() >= 0.5 ? lorem.generateParagraphs(Math.ceil(Math.random() * 5)) : undefined,
      created_by: Math.random() >= 0.5 ? humanNames.allRandom() : undefined
    }
    if (Object.keys(testObject).length === 3) {
      delete testObject.created_by;
    }

    chai.request(server)
        .post('/api/issues/apitest')
        .type('form')
        .send(testObject)
        .end((err, res) => {
          assert.equal(err, null);
          assert.equal(res.status, 200);
          const resObject = JSON.parse(res.text);
          assert.equal(resObject.error, 'required field(s) missing');
          done();
        });
  });

  // #4
  test('View issues on a project: GET request to /api/issues/{project}', done => {
    chai.request(server)
        .get('/api/issues/apitest')
        .send()
        .end((err, res) => {
          assert.equal(res.status, 200);
          const resObjects = JSON.parse(res.text);
          assert.isArray(resObjects);
          resObjects.forEach(issue => {
            assert.containsAllKeys(issue, [
              '_id',
              'issue_title',
              'issue_text',
              'created_by'
            ]);
          });
          done();
        });
  });

  // #5
  // TODO Optimize
  test('View issues on a project with one filter: GET request to /api/issues/{project}', done => {
    const openOrClosed = Math.random() >= 0.5 ? true : false;

    chai.request(server)
        .get('/api/issues/apitest')
        .query({
          open: openOrClosed
        })
        .send()
        .end((err, res) => {
          assert.equal(res.status, 200);
          const resObjects = JSON.parse(res.text);
          assert.isArray(resObjects);
          resObjects.forEach(issue => {
            assert.containsAllKeys(issue, [
              '_id',
              'issue_title',
              'issue_text',
              'created_by',
              'open'
            ]);
            assert.strictEqual(issue.open, openOrClosed);
          });
          done();
        });
  });

  // #6
  // TODO Optimize
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', done => {
    const openOrClosed = Math.random() >= 0.5 ? true : false;
    const created_by = 'XL';

    chai.request(server)
        .get('/api/issues/apitest')
        .query({
          open: openOrClosed,
          created_by
        })
        .send()
        .end((err, res) => {
          assert.equal(res.status, 200);
          const resObjects = JSON.parse(res.text);
          assert.isArray(resObjects);
          resObjects.forEach(issue => {
            assert.containsAllKeys(issue, [
              '_id',
              'issue_title',
              'issue_text',
              'created_by',
              'open'
            ]);
            assert.strictEqual(issue.open, openOrClosed);
            assert.equal(issue.created_by, created_by);
          });
          done();
        });
  });

  // #7
  // TODO Optimize _id
  test('Update one field on an issue: PUT request to /api/issues/{project}', done => {
    const _id = '6126761e97cecfd35de357b2';
    const result = 'successfully updated';
    const possibleFields = {
      issue_title: lorem.generateWords(Math.ceil(Math.random() * 10)),
      issue_text: lorem.generateParagraphs(Math.ceil(Math.random() * 5)),
      created_by: humanNames.allRandom(),
      assigned_to: humanNames.allRandom(),
      status_text: lorem.generateSentences(1),
      // open: Math.random() >= 0.5 ? true : false
      open: 'false'
    };

    const keys = Object.keys(possibleFields);
    const key = keys[Math.floor(Math.random() * keys.length)];

    chai.request(server)
        .put('/api/issues/apitest')
        .type('form')
        .send({
          _id,
          [key]: possibleFields[key]
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          const resObject = JSON.parse(res.text);
          assert.equal(resObject.result, result);
          assert.equal(resObject._id, _id);
          done();
        });
  });

  // #8
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', done => {
    const _id = '6126761e97cecfd35de357b2';
    const result = 'successfully updated';
    const possibleFields = {
      issue_title: lorem.generateWords(Math.ceil(Math.random() * 10)),
      issue_text: lorem.generateParagraphs(Math.ceil(Math.random() * 5)),
      created_by: humanNames.allRandom(),
      assigned_to: humanNames.allRandom(),
      status_text: lorem.generateSentences(1),
      open: 'false'
    };
    const keys = Object.keys(possibleFields);

    let i = 2;
    async.whilst(
      cb => cb(null, i < keys.length),
      callback => {
        const inputKeys = _.take(keys, i);
        const send = Object.assign({_id}, _.pick(possibleFields, inputKeys))
        chai.request(server)
            .put('/api/issues/apitest')
            .type('form')
            .send(send)
            .end((err, res) => {
              assert.equal(res.status, 200);
              const resObject = JSON.parse(res.text);
              assert.equal(resObject.result, result);
              assert.equal(resObject._id, _id);
              i++;
              // console.log(i, send, resObject); // DEBUG
              callback(null, i);
            });
      },
      (err, n) => {
        if (!err && n === keys.length) {
          done();
        }
      }
    );

  });

  // #9
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', done => {
    const error = 'missing _id';
    const possibleFields = {
      issue_title: lorem.generateWords(Math.ceil(Math.random() * 10)),
      issue_text: lorem.generateParagraphs(Math.ceil(Math.random() * 5)),
      created_by: humanNames.allRandom(),
      assigned_to: humanNames.allRandom(),
      status_text: lorem.generateSentences(1),
      open: 'false'
    };

    const keys = Object.keys(possibleFields);
    const key = keys[Math.floor(Math.random() * keys.length)];

    chai.request(server)
        .put('/api/issues/apitest')
        .type('form')
        .send({
          [key]: possibleFields[key]
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          const resObject = JSON.parse(res.text);
          assert.equal(resObject.error, error);
          done();
        });
  });
  
  
  

});
