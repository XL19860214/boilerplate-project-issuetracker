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


});
