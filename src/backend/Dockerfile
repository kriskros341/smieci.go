FROM golang:1.22 AS builder

WORKDIR /workspace

COPY go.mod go.sum main.go ./
RUN go mod download

COPY database/ database/
COPY models/ models/
COPY integrations/ integrations/
COPY helpers/ helpers/
COPY repository/ repository/
COPY api/ api/

RUN go build -o backend .

FROM ubuntu:22.04

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libc6 \
    && rm -rf /var/lib/apt/lists/* && apt-get clean

RUN mkdir uploads
COPY --from=builder /workspace/backend .

ENV GIN_MODE=release

EXPOSE 8080
CMD ["./backend"]
