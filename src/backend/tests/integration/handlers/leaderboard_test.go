package tests

import (
	"testing"
	"time"

	"backend/models"
	repositories "backend/repository"

	_ "github.com/lib/pq"

	"backend/tests/helpers"

	"github.com/stretchr/testify/assert"
)

func TestGetLeaderboardByType(t *testing.T) {
	db := helpers.SetupTestDB(t, `
		INSERT INTO users
			(id, username, email, profileimageurl)
		VALUES
			('1', 'user1', 'test@example.com', 'https://example.com/user1.png'),
			('2', 'user2', 'test2@example.com', 'https://example.com/user2.png');

		INSERT INTO markers
			(lat, long, points)
		VALUES
			(0, 0, 100),
			(0, 0, 200);

		INSERT INTO solutions
			(markerid, approved_at, verification_status)
		VALUES
			(1, '2024-11-01 12:00:00', 'approved'),
			(2, '2024-11-19 12:00:00', 'approved');

		INSERT INTO solutions_users_relation
			(userid, solutionid)
		VALUES
			(1, 1),
			(1, 2),
			(2, 1);
	`)
	defer db.Close()
	repo := repositories.NewLeaderboardRepository(db)

	repositories.CurrentTime = func() time.Time {
		return time.Date(2024, 11, 24, 0, 0, 0, 0, time.UTC)
	}

	tests := []struct {
		leaderboardType models.LeaderboardType
		expectedResults int
	}{
		{models.Weekly, 1},
		{models.Monthly, 2},
		{models.AllTime, 2},
	}

	for _, tt := range tests {
		t.Run(string(tt.leaderboardType), func(t *testing.T) {
			result, err := repo.GetLeaderboardByType(tt.leaderboardType)
			assert.NoError(t, err)
			assert.Len(t, result, tt.expectedResults)
		})
	}
}
