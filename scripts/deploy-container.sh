AWS_REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity | head -n3 | tail -n1 | sed 's/.*: "\(.*\)",/\1/')
REPOSITORY_NAME="video-thumbnailer"

IMAGE_URI="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPOSITORY_NAME"

docker build -t $IMAGE_URI ../docker

aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $IMAGE_URI

docker push $IMAGE_URI
