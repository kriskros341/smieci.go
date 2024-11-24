go get .
to start api: go run .

crons:
docker build -t crons -f cron/Dockerfile .
docker run -t -i crons