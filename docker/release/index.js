'use strict';

const core = require('@actions/core');
const artifact = require('@actions/artifact').create();
const github = require('@actions/github');
const parser = require('action-input-parser');
const exec = require('child_process').exec;
const path = require('path');

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

async function tagImage(imageName, tag) {
  const command = `docker tag ${imageName} ${tag}`;
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      console.log(stdout);
      console.error(stderr);
      err ? reject(err) : resolve(stdout);
    })
  });
}

async function pushImage(tag) {
  const command = `docker push ${tag}`;
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
    const tags = parser.getInput('tags', { type: 'array' });

    await artifact.downloadArtifact(imageName);
    await loadImage(imagePath);

    await buildImage(dockerfile, context, tags);

    for (const tag of tags) {
      await tagImage(imageName, tag);
      await pushImage(tag);
    }

    await new Promise(resolve => {
      exec('docker images', (err, stdout, stderr) => {
        console.log(stdout);
        resolve();
      })
    })

    /*
    await exportImage(imageName, imagePath);
    await artifact.uploadArtifact(imageName, [imagePath], '.');
    */
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();