# Video Thumbnailer
[![serverless](https://img.shields.io/badge/serverless-3.15.2-FD5750?style=flat-square&logo=serverless)](https://www.serverless.com/)
[![eslint](https://img.shields.io/badge/eslint-8.20.0-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![airbnb-style](https://flat.badgen.net/badge/style-guide/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![jest](https://img.shields.io/badge/jest-28.1.3-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![typescript](https://img.shields.io/badge/typescript-4.7.4-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://raw.githubusercontent.com/DiegoVictor/video-thumbnailer/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)<br>
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=Video%20Thumbnailer&uri=https%3A%2F%2Fraw.githubusercontent.com%2FDiegoVictor%2Fvideo-thumbnailer%2Fmain%2FInsomnia_2022-07-30.json)

This application trigger a container with ffmpeg to generate thumbnails when a video is uploaded into a S3 Bucket folder.

![Infrastructure Diagram]()

## Table of Contents
* [Requirements](#requirements)
* [Install](#install)
# Requirements
* Node.js ^14.15.0
* Serveless Framework
* AWS Account
  * [S3](https://aws.amazon.com/s3/)
  * [Lambda](https://aws.amazon.com/lambda)
  * [API Gateway](https://aws.amazon.com/api-gateway/)
  * [Elastic Container Registry](https://aws.amazon.com/pt/ecr/)
  * [Fargate](https://aws.amazon.com/pt/fargate/)

# Install
```
npm install
```
Or simple:
```
yarn
```
> Was installed and configured the [`eslint`](https://eslint.org/) and [`prettier`](https://prettier.io/) to keep the code clean and patterned.

