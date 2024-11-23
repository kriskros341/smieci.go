GO=go
BIN_DIR=bin
SRC_DIR=src

all: build

build: update-available-points

update-available-points:
	$(GO) build -o $(BIN_DIR)/update-available-points $(SRC_DIR)/update-available-points/main.go

clean:
	rm -f $(BIN_DIR)/update-available-points

