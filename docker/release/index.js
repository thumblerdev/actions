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

async function loadImage(fileName) {
  const command = `docker load -i ${fileName}`;
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
    const imageName = parser.getInput('name');
    const imagePath = imageName + '.tgz';
    //const tags = parser.getInput('tags', { type: 'array' });

    await artifact.downloadArtifact(imageName);
    await loadImage(imagePath);

    await new Promise(resolve => {
      exec('docker images', (err, stdout, stderr) => {
        console.log(stdout);
        resolve();
      })
    })

    /*
    await buildImage(dockerfile, context, tags);
    await exportImage(imageName, imagePath);
    await artifact.uploadArtifact(imageName, [imagePath], '.');
    */
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();