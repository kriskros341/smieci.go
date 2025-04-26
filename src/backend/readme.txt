go get .
to start api: go run .

crons:
DOCKER_BUILDKIT=1 docker build -t crons -f cron/Dockerfile .
DOCKER_BUILDKIT=1 docker run -t -i crons

remember to pass the DOCKER_BUILDKIT=1 flag to enable the mount type caching 
