GO=go
BIN_DIR=bin
SRC_DIR=src

all: build

build: update-available-points fetch-government-markers

update-available-points:
	$(GO) build -o $(BIN_DIR)/update-available-points $(SRC_DIR)/update-available-points/main.go

fetch-government-markers:
	$(GO) build -o $(BIN_DIR)/fetch-government-markers $(SRC_DIR)/fetch-government-markers/main.go

clean:
	rm -f $(BIN_DIR)/update-available-points $(BIN_DIR)/fetch-government-markers

