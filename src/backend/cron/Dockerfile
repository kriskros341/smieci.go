FROM golang:1.22 AS build

WORKDIR /workspace

COPY cron/ cron/
COPY database/ database/
COPY models/ models/
COPY go.mod go.sum ./

RUN mkdir repository
COPY repository/users.go repository/users.go

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

COPY --from=build /workspace/cron/bin/update-available-points /bin/
COPY --from=build /workspace/cron/cronjobs/* /etc/cron.d/

RUN chmod 0644 /etc/cron.d/* && chmod +x /bin/update-available-points
RUN touch /logs/update-available-points.log && chmod 0666 /logs/update-available-points.log

RUN crontab /etc/cron.d/*

CMD cron && tail -f /logs/update-available-points.log