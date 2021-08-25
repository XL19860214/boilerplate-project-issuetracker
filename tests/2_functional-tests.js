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

});
