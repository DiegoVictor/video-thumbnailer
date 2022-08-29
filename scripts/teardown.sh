REPOSITORY_NAME="video-thumbnailer"
SLS_STAGE="dev"
BUCKET_NAME="video-thumbnailer-$SLS_STAGE"

aws ecr batch-delete-image --repository-name $REPOSITORY_NAME --image-ids imageTag=latest

aws s3 rm s3://$BUCKET_NAME --recursive
