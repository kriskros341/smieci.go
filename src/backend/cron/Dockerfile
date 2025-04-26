FROM golang:1.22 AS builder

WORKDIR /workspace

COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download

COPY cron/ cron/

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=bind,source=/database,target=/workspace/database \
    --mount=type=bind,source=/models,target=/workspace/models \
    --mount=type=bind,source=/integrations,target=/workspace/integrations \
    --mount=type=bind,source=/helpers,target=/workspace/helpers \
    --mount=type=bind,source=/api,target=/workspace/api \
    --mount=type=bind,source=/repository/users.go,target=/workspace/repository/users.go \
    --mount=type=bind,source=/repository/markers.go,target=/workspace/repository/markers.go \
    cd cron && make build

FROM ubuntu:22.04

WORKDIR /app

RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    apt-get update && apt-get install -y \
    cron \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/cron.d /bin /logs /var/log/cron

COPY --from=builder /workspace/cron/bin/* /bin/
COPY --from=builder /workspace/cron/cronjobs/* /etc/cron.d/

RUN chmod 0644 /etc/cron.d/* && chmod +x /bin/*
RUN crontab /etc/cron.d/*

# There is a bug and it only prints logs of only one cron. On our VPS we should have docker per cron, but crontab running globally, not inside container.
CMD echo "Starting cron container..." && printenv | grep -v "no_proxy" >> /etc/environment && cron -f
