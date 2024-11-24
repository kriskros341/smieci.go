#!/bin/bash

set -eou pipefail

MAX_RETRIES=15
RETRY_COUNT=0

docker compose -f docker-compose.test.yml down -v

echo "Starting PostgreSQL container..."
docker compose -f docker-compose.test.yml up -d

echo "Waiting for PostgreSQL to be healthy..."
until [ "$(docker inspect --format '{{.State.Health.Status}}' $(docker compose ps -q postgres))" == "healthy" ]; do
  RETRY_COUNT=$((RETRY_COUNT + 1))

  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "PostgreSQL is not healthy after $MAX_RETRIES attempts. Exiting..."
    docker compose -f docker compose.test.yml down -v
    exit 1
  fi

  echo "PostgreSQL is not healthy yet (attempt $RETRY_COUNT of $MAX_RETRIES), waiting..."
  sleep 1
done


echo "Running migrations..."
migrate -database 'postgres://postgres:dbpass@localhost:5432/postgres?sslmode=disable' -path ./src/backend/migrations up

echo "Running tests..."
go test ./src/backend/tests/integration/... -v 

echo "Shutting down Docker Compose..."
docker compose -f docker-compose.test.yml down -v

exit 0
