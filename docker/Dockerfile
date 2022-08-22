FROM ubuntu:latest

RUN apt-get update -y && apt-get upgrade -y

RUN apt-get install ffmpeg curl unzip -y

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && ./aws/install

ADD . .

CMD ./main.sh
