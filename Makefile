migrate-download:
	curl -L https://github.com/golang-migrate/migrate/releases/download/v4.18.1/migrate.linux-amd64.tar.gz | tar xvz && mv migrate /usr/bin

migrate-up:
	migrate -database 'postgres://postgres:dbpass@localhost:5432/postgres?sslmode=disable' -path src/backend/migrations up 


migrate-down:
	migrate -database 'postgres://postgres:dbpass@localhost:5432/postgres?sslmode=disable' -path src/backend/migrations down

drop:
	migrate -database 'postgres://postgres:dbpass@localhost:5432/postgres?sslmode=disable' -path src/backend/migrations drop
