package repositories

import (
	"backend/database"
	"backend/models"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
)

type MarkerRepository interface {
	GetMarkersCoordinates() ([]models.MarkerCoordinates, error)
	GetMarkerById(markerId string) (*models.GetMarkerPayload, error)
	CreateMarker(marker models.CreateMarkerBody, userId string, uploadsIds []int64) error
	SupportMarker(userId string, markerId int64, amount int64) error
	GetMarkerSupporters(markerId string) ([]models.GetMarkerSupportersResult, error)
}

type markerRepository struct {
	db *sqlx.DB
}

func NewMarkerRepository(db *sqlx.DB) MarkerRepository {
	return &markerRepository{db: db}
}

func (r *markerRepository) GetMarkersCoordinates() ([]models.MarkerCoordinates, error) {
	var markers []models.MarkerCoordinates
	query := `
		SELECT m.id, m.lat, m.long, m.mainPhotoId, u.blurhash 
		FROM markers m 
		JOIN uploads u ON u.id = m.mainPhotoId`
	println("Executing queyr", query)
	err := r.db.Select(&markers, query)
	return markers, err
}

func (r *markerRepository) GetMarkerById(markerId string) (*models.GetMarkerPayload, error) {
	var marker models.GetMarkerPayload
	query := `SELECT id, lat, long, userId, points FROM markers WHERE id = $1`
	println("Executing query", query, markerId)
	err := r.db.Get(&marker, query, markerId)
	if err != nil {
		return &marker, err
	}

	uploads, err := r.GetMarkerUploads(markerId)
	if err != nil {
		return &marker, err
	}

	for _, upload := range uploads {
		marker.FileNamesString = append(marker.FileNamesString, fmt.Sprintf("%d", upload.Id))
		marker.BlurHashes = append(marker.BlurHashes, upload.BlurHash)
	}

	return &marker, nil
}

func (r *markerRepository) GetMarkerUploads(markerId string) ([]models.Upload, error) {
	var uploads []models.Upload
	query := `SELECT u.id, u.filename, u.blurhash FROM relation_marker_uploads rmu JOIN uploads u ON rmu.uploadId = u.id WHERE rmu.markerId = $1`
	println("Executing query:", query, markerId)
	err := r.db.Select(&uploads, query, markerId)
	return uploads, err
}

func (r *markerRepository) CreateMarker(marker models.CreateMarkerBody, userId string, uploadsIds []int64) error {
	data := map[string]interface{}{
		"userId":      userId,
		"lat":         marker.Latitude,
		"long":        marker.Longitude,
		"mainPhotoId": uploadsIds[0],
	}
	query := `
		INSERT INTO markers (userId, lat, long, mainPhotoId)
		VALUES (:userId, :lat, :long, :mainPhotoId)
		RETURNING id;`

	var markerId int64
	stmt, err := r.db.PrepareNamed(query)
	if err != nil {
		return err
	}
	fmt.Println("Executing query:", query)
	err = stmt.Get(&markerId, data)
	if err != nil {
		return err
	}

	rows := []string{}
	for i := 0; i < len(uploadsIds); i++ {
		rows = append(rows, fmt.Sprintf(`(%d, %d)`, markerId, uploadsIds[i]))
	}

	insertedMarkerUploadsRelations := strings.Join(rows, ",")

	query = fmt.Sprintf(`INSERT INTO relation_marker_uploads (markerId, uploadId) VALUES %s`, insertedMarkerUploadsRelations)

	fmt.Println("Executing query:", query)

	_, err = r.db.Exec(query)
	if err != nil {
		return err
	}

	if err != nil {
		return err
	}

	return err
}

func (r *markerRepository) SupportMarker(userId string, markerId int64, amount int64) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}

	// Separate points and support points
	// Validate supportPoints in User

	usersQuery := `UPDATE users SET supportPoints = supportPoints - $1 WHERE id = $2`
	markersQuery := `UPDATE markers SET points = points + $1 WHERE id = $2`
	tracesQuery := fmt.Sprintf(`INSERT INTO points_traces (userId, markerId, amount, type) VALUES ($1, $2, $3, '%s')`, string(database.PointTraceTypeMarkerSupport))

	if _, err := tx.Exec(usersQuery, amount, userId); err != nil {
		tx.Rollback()
		return err
	}
	if _, err := tx.Exec(markersQuery, amount, markerId); err != nil {
		tx.Rollback()
		return err
	}
	if _, err := tx.Exec(tracesQuery, userId, markerId, amount); err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()
}

func (r *markerRepository) GetMarkerSupporters(markerId string) ([]models.GetMarkerSupportersResult, error) {
	var supporters []models.GetMarkerSupportersResult
	query := fmt.Sprintf(`
		SELECT u.id as id, u.username, SUM(pt.amount) as total, u.profileImageUrl 
		FROM points_traces pt 
		JOIN users u ON pt.userId = u.id 
		WHERE pt.markerId = $1 AND pt.type = '%s'
		GROUP BY u.id`, string(database.PointTraceTypeMarkerSupport))
	fmt.Printf("Executing query: %s\n", query)
	err := r.db.Select(&supporters, query, markerId)
	return supporters, err
}
