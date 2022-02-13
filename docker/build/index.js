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

  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      console.log(stdout);
      console.error(stderr);
      err ? reject(err) : resolve(stdout);
    })
  });
}

async function exportImage(imageName, fileName) {
  const command = `docker save ${imageName} -o ${fileName}`;
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      console.log(stdout);
      console.error(stderr);
      err ? reject(err) : resolve(stdout);
    })
  });
}

async function main() {
  try {
    const tags = parser.getInput('tags', { type: 'array' });
    const context = parser.getInput('context');
    const dockerfile = parser.getInput('dockerfile');
    const imageName = path.basename(tags[0]);
    const imagePath = imageName + '.tgz';
    console.log(imageName, imagePath);

    await buildImage(dockerfile, context, tags);
    await exportImage(imageName, imagePath);
    const { stdout, stderr } = await exec('ls');
    console.log(stdout, stderr);
    await artifact.uploadArtifact(imageName, imagePath, '.');
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();