package handlers

import (
	"github.com/jmoiron/sqlx"
	svix "github.com/svix/svix-webhooks/go"
)

type Env struct {
	Db *sqlx.DB
	Wh *svix.Webhook
}
