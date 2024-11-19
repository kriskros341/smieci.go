migrate-up:
	migrate -database 'postgres://postgres:dbpass@localhost:5432/postgres?sslmode=disable' -path src/backend/migrations up

migrate-down:
	migrate -database 'postgres://postgres:dbpass@localhost:5432/postgres?sslmode=disable' -path src/backend/migrations down

drop:
	migrate -database 'postgres://postgres:dbpass@localhost:5432/postgres?sslmode=disable' -path src/backend/migrations drop
