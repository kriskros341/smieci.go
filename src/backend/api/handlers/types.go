package handlers

import "github.com/jmoiron/sqlx"

type Env struct {
	Db *sqlx.DB
}
