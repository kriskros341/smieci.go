FROM golang:1.22 AS build

WORKDIR /workspace

COPY cron/ cron/
COPY database/ database/
COPY models/ models/
COPY integrations/ integrations/
COPY go.mod go.sum ./

RUN mkdir repository
COPY repository/users.go repository/users.go
COPY repository/markers.go repository/markers.go

RUN apt-get update && apt-get install -y \
    make \
    cron \
    && rm -rf /var/lib/apt/lists/*

RUN cd cron && make build

FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y cron && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
RUN mkdir -p /etc/cron.d /bin /logs
RUN mkdir -p /var/log/cron

COPY --from=build /workspace/cron/bin/* /bin/
COPY --from=build /workspace/cron/cronjobs/* /etc/cron.d/

RUN chmod 0644 /etc/cron.d/* && chmod +x /bin/*

RUN crontab /etc/cron.d/*

# There is a bug and it only prints logs of only one cron. On our VPS we should have docker per cron, but crontab running globally, not inside container.
CMD echo "Starting cron container..." && cron -f