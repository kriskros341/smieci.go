package repositories

import (
	"backend/database"
	"backend/models"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type SolutionsRepository interface {
	GetSolutionsInfoForMarker(markerId string) (*models.LatestSolutionPayload, error)
	CreateSolution(markerId string, participantsIds []string, primaryFilesIds []int64, additionalFilesIds []int64) error
	DoesExistById(solutionId string) (bool, error)
	ApproveMarkerSolution(solutionId string) error
	DenyMarkerSolution(solutionId string) error
	ReopenMarkerSolution(solutionId string) error
	GetSolutionStatus(solutionId string) (database.SolutionStatus, error)
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

func (r *solutionsRepository) GetSolutionsInfoForMarker(markerId string) (*models.LatestSolutionPayload, error) {

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

func (r *solutionsRepository) DoesExistById(solutionId string) (bool, error) {
	query := fmt.Sprintf(`select id from solutions where id = $1`)
	fmt.Printf("executing query: %s, with parameter %s", query, solutionId)
	rows, err := r.db.Queryx(query, solutionId)
	if err != nil {
		return false, err
	}
	defer rows.Close()
	if !rows.Next() {
		return false, nil
	}

	return true, nil
}

func (r *solutionsRepository) ApproveMarkerSolution(solutionId string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	// update solution status and return marker points
	var totalPoints int64
	{
		status := "approved"
		query := `UPDATE solutions s set verification_status = $1 from markers m WHERE s.id = $2 and markerid = m.id RETURNING m.points`
		println("Executing ", query, status, solutionId)
		err := tx.Get(&totalPoints, query, status, solutionId)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to update solution status: %w", err)
		}
	}

	// Get count of participants
	var participantsCount int64
	{
		// Get participants count
		query := "SELECT COUNT(id) FROM solutions_users_relation WHERE solutionId = $1"
		println("Executing ", query)
		err := tx.Get(&participantsCount, query, solutionId)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to fetch participants count: %w", err)
		}

		if participantsCount == 0 {
			tx.Rollback()
			return fmt.Errorf("no participants found for solution ID %s", solutionId)
		}
	}

	// Increment points of participants
	{
		var query = `
			UPDATE users
				SET points = points + $1
				FROM solutions_users_relation sur
			WHERE sur.solutionId = $2;
		`
		println("Executing ", query, totalPoints/participantsCount, solutionId)
		_, err := tx.Exec(query, totalPoints/participantsCount, solutionId)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to update user points: %w", err)
		}
	}

	// KCTODO: CREATE POINTS TRACES??

	err = tx.Commit()
	if err != nil {
		return err
	}
	return nil
}

func (r *solutionsRepository) DenyMarkerSolution(solutionId string) error {
	Status := "denied"
	query := fmt.Sprintf("UPDATE solutions set verification_status = '%s' WHERE id = %s RETURNING markerId", Status, solutionId)
	_, err := r.db.Exec(query)
	return err
}

func (r *solutionsRepository) ReopenMarkerSolution(solutionId string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	// update solution status and return marker points
	var totalPoints int64
	{
		status := "pending"
		query := `UPDATE solutions s set verification_status = $1 from markers m WHERE s.id = $2 and markerid = m.id RETURNING m.points`
		println("Executing ", query, status, solutionId)
		err := tx.Get(&totalPoints, query, status, solutionId)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to update solution status: %w", err)
		}
	}

	// Get count of participants
	var participantsCount int64
	{
		// Get participants count
		query := "SELECT COUNT(id) FROM solutions_users_relation WHERE solutionId = $1"
		println("Executing ", query)
		err := tx.Get(&participantsCount, query, solutionId)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to fetch participants count: %w", err)
		}

		if participantsCount == 0 {
			tx.Rollback()
			return fmt.Errorf("no participants found for solution ID %s", solutionId)
		}
	}

	// Revoke points of participants
	{
		var query = `
			UPDATE users
				SET points = points - $1
				FROM solutions_users_relation sur
			WHERE sur.solutionId = $2;
		`
		println("Executing ", query, totalPoints/participantsCount, solutionId)
		_, err := tx.Exec(query, totalPoints/participantsCount, solutionId)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to update user points: %w", err)
		}
	}

	// KCTODO: CREATE POINTS TRACES??

	err = tx.Commit()
	if err != nil {
		return err
	}
	return nil
}

func (r *solutionsRepository) GetSolutionStatus(solutionId string) (database.SolutionStatus, error) {
	var solutionStatus database.SolutionStatus
	err := r.db.Get(&solutionStatus, "SELECT verification_status FROM solutions WHERE id = $1", solutionId)
	return solutionStatus, err
}
