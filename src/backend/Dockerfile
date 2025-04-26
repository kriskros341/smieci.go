FROM golang:1.22 AS builder

WORKDIR /workspace

COPY go.mod go.sum main.go ./
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=bind,source=./database,target=/workspace/database \
    --mount=type=bind,source=./models,target=/workspace/models \
    --mount=type=bind,source=./integrations,target=/workspace/integrations \
    --mount=type=bind,source=./helpers,target=/workspace/helpers \
    --mount=type=bind,source=./repository,target=/workspace/repository \
    --mount=type=bind,source=./api,target=/workspace/api \
    go build -o backend .

FROM ubuntu:22.04

WORKDIR /app

RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libc6 \
    && mkdir -p uploads

COPY --from=builder /workspace/backend .

ENV GIN_MODE=release

EXPOSE 8080
CMD ["./backend"]
