FROM golang:1.22 AS builder

WORKDIR /workspace

COPY go.mod go.sum ./
RUN go mod download

COPY cron/ cron/
COPY database/ database/
COPY models/ models/
COPY integrations/ integrations/
COPY helpers/ helpers/
COPY api/ api/

COPY repository/users.go repository/markers.go repository/

RUN cd cron && make build

FROM ubuntu:22.04

WORKDIR /app

RUN apt-get update && apt-get install -y \
    cron \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/cron.d /bin /logs /var/log/cron

COPY --from=builder /workspace/cron/bin/* /bin/
COPY --from=builder /workspace/cron/cronjobs/* /etc/cron.d/

RUN chmod 0644 /etc/cron.d/* && chmod +x /bin/*
RUN crontab /etc/cron.d/*

# There is a bug and it only prints logs of only one cron. On our VPS we should have docker per cron, but crontab running globally, not inside container.
CMD echo "Starting cron container..." && printenv | grep -v "no_proxy" >> /etc/environment && cron -f
