# Video Thumbnailer
![CircleCI](https://img.shields.io/circleci/build/github/DiegoVictor/video-thumbnailer?style=flat-square&logo=circleci)
[![serverless](https://img.shields.io/badge/serverless-3.15.2-FD5750?style=flat-square&logo=serverless)](https://www.serverless.com/)
[![eslint](https://img.shields.io/badge/eslint-8.20.0-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![airbnb-style](https://flat.badgen.net/badge/style-guide/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![jest](https://img.shields.io/badge/jest-28.1.3-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![typescript](https://img.shields.io/badge/typescript-4.7.4-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![coverage](https://img.shields.io/codecov/c/gh/DiegoVictor/video-thumbnailer?logo=codecov&style=flat-square)](https://codecov.io/gh/DiegoVictor/video-thumbnailer)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://raw.githubusercontent.com/DiegoVictor/video-thumbnailer/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)<br>
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=Video%20Thumbnailer&uri=https%3A%2F%2Fraw.githubusercontent.com%2FDiegoVictor%2Fvideo-thumbnailer%2Fmain%2FInsomnia_2022-07-30.json)

This application trigger a container with ffmpeg to generate thumbnails when a video is uploaded into a S3 Bucket folder.

![Infrastructure Diagram](https://raw.githubusercontent.com/DiegoVictor/video-thumbnailer/main/VideoThumbnailer.drawio.png)

## Table of Contents
* [Requirements](#requirements)
* [Install](#install)
  * [Deploy](#configure)
    * [Container](#container)
      * [Useful Links](useful-links)
  * [Teardown](#teardown)
* [Usage](#usage)
* [Running the tests](#running-the-tests)
  * [Coverage report](#coverage-report)

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

## Deploy
Deploy the application:
```
$ sls deploy
```
Now push the container image:
```
$ cd scripts
$ ./deploy-container.sh
```

The script will:

1. Build the container image.
2. Get authentication credentials in the ECR service.
3. Push the container to the ECR repository created during the deploy.

### Container
This container make usage of the [aws cli](https://aws.amazon.com/cli) to download the mp4 video file uploaded in the S3 Bucket, makes some calculations, then it uses [ffmpeg](https://ffmpeg.org/) binary to capture a thumbnail at each 1 second of video and save them into a single file.
> Refer to the `docker/main.sh` script.

![Output]()

Once the thumbnails file is generate it is uploaded into S3 Bucket.

#### Useful Links
* https://trac.ffmpeg.org/wiki/FilteringGuide
* http://ffmpeg.org/ffmpeg-filters.html#streamselect_002c-astreamselect

## Teardown
To completly remove the resources from AWS, follow these steps:
1. Run the teardown script:
```
$ cd scripts
$ ./teardown.sh
```
2. Then remove the stack:
```
$ sls remove
```
That is all.

# Usage
After deploy the application use the outputed Lambda URL to request a signed URL to upload a video file:
```
GET /signedURL
```
Then use the `signedUrl` to upload the video file:
```
PUT <signed URL>
```
Once the upload finish S3 will trigger a Lambda that will fire a container to generate the video thumbnails file, all you need to do is wait the generated file be uploaded in the same S3 Bucket in a folder called `preview`.

# Running the tests
[Jest](https://jestjs.io/) was the choice to test the app, to run:
```
$ yarn test
```
Or:
```
$ npm run test
```
> Run the command in the root folder

## Coverage report
You can see the coverage report inside `tests/coverage`. They are automatically created after the tests run.
