'use strict';

const core = require('@actions/core');
const github = require('@actions/github');
const parser = require('action-input-parser');
const exec = require('child_process').exec;

try {
  const tags = parser.getInput('tags', {type: 'array'});
  const context = parser.getInput('context');
  const dockerfile = parser.getInput('dockerfile');

  const command = ```
    docker build \
      ${tags.map(tag => '-t ' + tag).join(' ')} \
      ${context} \
      -f ${dockerfile}
  ```;

  console.log(command);

  /*
  exec(command, (err, stdout, stderr) => {
    console.log(stdout);
    console.error(stderr);
    if (err) {
      core.setFailed(err);
    }
  })
  */
} catch (error) {
  core.setFailed(error.message);
}