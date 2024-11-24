package repositories

import (
	"backend/models"
	"errors"

	"time"

	"github.com/jmoiron/sqlx"
)

type LeaderboardRepository interface {
	GetLeaderboardByType(models.LeaderboardType) ([]models.LeaderboardEntry, error)
}

type leaderboardRepository struct {
	db *sqlx.DB
}

func NewLeaderboardRepository(db *sqlx.DB) LeaderboardRepository {
	return &leaderboardRepository{db: db}
}

func (r *leaderboardRepository) GetLeaderboardByType(leaderboard models.LeaderboardType) ([]models.LeaderboardEntry, error) {
	var leaderboardEntries []models.LeaderboardEntry

	var startDate time.Time
	switch leaderboard {
	case models.Weekly:
		startDate = startOfWeek()
	case models.Monthly:
		startDate = startOfMonth()
	case models.AllTime:
		startDate = allTime()
	default:
		return nil, errors.New("invalid leaderboard type")
	}

	query := `
	with nr_participants_per_solution as (select sur.solutionid, count(sur.userid) as cnt
                                      from solutions_users_relation sur
                                      group by solutionid)
	select u.id as userId, u.username, u.profileimageurl as imageUrl, SUM(m.points) / max(npps.cnt) as numberOfPoints
	from users u
         left join solutions_users_relation sur on u.id = sur.userid
         left join solutions s on sur.solutionid = s.id
         LEFT JOIN markers m ON s.markerid = m.id
         left join nr_participants_per_solution npps on s.id = npps.solutionid
	where s.approved_at > $1
	and s.verification_status = 'approved'
	group by u.id order by numberOfPoints desc LIMIT 10;`

	err := r.db.Select(&leaderboardEntries, query, startDate)
	return leaderboardEntries, err
}

var CurrentTime = func() time.Time {
	return time.Now()
}

func startOfWeek() time.Time {
	now := CurrentTime()
	dayOfWeek := now.Weekday()
	daysSinceMonday := int(dayOfWeek) - int(time.Monday)

	if daysSinceMonday < 0 {
		daysSinceMonday += 7
	}

	startOfWeek := now.AddDate(0, 0, -daysSinceMonday).Truncate(24 * time.Hour)
	return startOfWeek
}

func startOfMonth() time.Time {
	now := CurrentTime()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	return startOfMonth
}

func allTime() time.Time {
	return time.Date(1970, time.January, 1, 0, 0, 0, 0, time.UTC)
}
