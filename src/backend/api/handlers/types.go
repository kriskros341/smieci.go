package handlers

import (
	repositories "backend/repository"

	"github.com/jmoiron/sqlx"
	svix "github.com/svix/svix-webhooks/go"
)

type Env struct {
	Db          *sqlx.DB
	Wh          *svix.Webhook
	Markers     repositories.MarkerRepository
	Uploads     repositories.UploadsRepository
	Solutions   repositories.SolutionsRepository
	Users       repositories.UsersRepository
	Leaderboard repositories.LeaderboardRepository
}
