#!/bin/bash

aws s3 cp s3://$BUCKET_NAME/$VIDEO_PATH video.mp4

DURATION_IN_SECONDS=`ffprobe -show_streams "video.mp4" 2> /dev/null | grep duration | head -n2 | tail -n1 | sed 's/.*=//'`

get_ceil () {
  RESULT=$(awk -v value=$1 'BEGIN{ print int(value)<value }')
  if [ "$RESULT" -eq 1 ]; then
    echo $(awk -v value=$1 'BEGIN{ print int(value)+1 }')
  else
    echo "$1"
  fi
}

RESULT=$(awk '{print $1/10}' <<< "${DURATION_IN_SECONDS}")
ROWS=$(get_ceil $RESULT)

ffmpeg -y -i "video.mp4" -frames 1 -q:v 0 -vf "select=isnan(prev_selected_t)+gte(t-prev_selected_t\,1),scale=320:-1,tile=10x$ROWS" preview.jpg

FILE_NAME=$(echo $VIDEO_PATH | sed 's/videos\///' | sed 's/.mp4//');

aws s3 cp preview.jpg s3://$BUCKET_NAME/preview/$FILE_NAME.jpg
