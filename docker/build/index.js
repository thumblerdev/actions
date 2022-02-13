'use strict';

const core = require('@actions/core');
const artifact = require('@actions/artifact').create();
const github = require('@actions/github');
const parser = require('action-input-parser');
const exec = require('child_process').exec;
const path = require('path');

async function buildImage(dockerfile, context, tags) {
  const command = `
    docker build \
      ${tags.map(tag => '-t ' + tag).join(' ')} \
      ${context} \
      -f ${dockerfile}
  `;

  return exec(command);
}

async function exportImage(imageName, fileName) {
  const command = `docker save ${imageName} -o ${fileName}`;

  return exec(command);
}

async function main() {
  try {
    const tags = parser.getInput('tags', { type: 'array' });
    const context = parser.getInput('context');
    const dockerfile = parser.getInput('dockerfile');
    const imageName = path.basename(tags[0]);

    await buildImage(dockerfile, context, tags);
    await exportImage(imageName, imageName + '.tgz');
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();