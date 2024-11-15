package repositories

import (
	"backend/models"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type SolutionsRepository interface {
	GetLatestSolutionForMarker(markerId string) (*models.LatestSolutionPayload, error)
	CreateSolution(markerId string, participantsIds []string, primaryFilesIds []int64, additionalFilesIds []int64) error
}

type solutionsRepository struct {
	db *sqlx.DB
}

func NewSolutionsRepository(db *sqlx.DB) SolutionsRepository {
	return &solutionsRepository{db: db}
}

type VerificationStatus struct {
	VerificationStatus string `db:"verification_status"`
	Id                 int64  `db:"id"`
}

func (r *solutionsRepository) GetLatestSolutionForMarker(markerId string) (*models.LatestSolutionPayload, error) {

	var latestSolutionId int64
	var pendingVerificationsCount int64

	var solutions []VerificationStatus
	query := fmt.Sprintf("SELECT id, verification_status FROM solutions WHERE markerid = %s", markerId)
	err := r.db.Select(&solutions, query)
	if err != nil {
		return nil, err
	}

	for _, currentSolution := range solutions {
		fmt.Println(currentSolution)
		if currentSolution.VerificationStatus == "approved" {
			latestSolutionId = currentSolution.Id
			pendingVerificationsCount = -1
			break
		} else if currentSolution.VerificationStatus == "pending" {
			latestSolutionId = currentSolution.Id
			pendingVerificationsCount += 1
		}
	}

	var result models.LatestSolutionPayload
	result.LatestSolutionId = latestSolutionId
	result.PendingVerificationsCount = pendingVerificationsCount
	return &result, nil
}

func (r *solutionsRepository) CreateSolution(markerId string, participantsIds []string, primaryFilesIds []int64, additionalFilesIds []int64) error {
	tx, err := r.db.Begin()

	// STEP: Create solution
	var solutionId int
	insertSolutionQuery := fmt.Sprintf(`INSERT INTO solutions (markerid) VALUES (%s) RETURNING id`, markerId)
	fmt.Println("Executing query: %s", insertSolutionQuery)
	err = tx.QueryRow(insertSolutionQuery).Scan(&solutionId)
	if err != nil {
		tx.Rollback()
		return err
	}

	// STEP: POPULATE SOLUTIONS-USERS RELATION
	{
		values := []string{}
		for _, participantId := range participantsIds {
			values = append(values, fmt.Sprintf(`(%d, '%s')`, solutionId, participantId))
		}
		insertSolutionUsersQuery := fmt.Sprintf(`INSERT INTO solutions_users_relation (solutionid, userId) VALUES %s`, strings.Join(values, ","))
		fmt.Println("Executing query:", insertSolutionUsersQuery)
		_, err := tx.Exec(insertSolutionUsersQuery)

		if err != nil {
			var error = gin.H{"error": err.Error()}
			fmt.Println(error)
			tx.Rollback()
			return err
		}
	}

	// STEP: POPULATE SOLUTION-UPLOADS RELATION
	{
		values := []string{}
		for _, uploadId := range primaryFilesIds {
			values = append(values, fmt.Sprintf(`('%d', '%d', 'primary')`, solutionId, uploadId))
		}
		for _, uploadId := range additionalFilesIds {
			values = append(values, fmt.Sprintf(`('%d', '%d', 'additional')`, solutionId, uploadId))
		}
		insertSolutionUsersQuery := fmt.Sprintf(`INSERT INTO solutions_uploads_relation (solutionid, uploadid, uploadtype) VALUES %s`, strings.Join(values, ","))
		fmt.Println("Executing query:", insertSolutionUsersQuery)
		_, err := tx.Exec(insertSolutionUsersQuery)

		if err != nil {
			var error = gin.H{"error": err.Error()}
			fmt.Println(error)
			tx.Rollback()
			return err
		}
	}

	tx.Commit()
	return nil
}

func (r *solutionsRepository) GetSolution(solutionId string) {

}
