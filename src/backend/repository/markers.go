package repositories

import (
	"backend/database"
	"backend/helpers"
	"backend/models"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/jmoiron/sqlx"
)

type MarkerRepository interface {
	GetMarkers() ([]models.Marker, error)
	GetMarkersInRegion(latitude float64, longitude float64, latitudeDelta float64, longitudeDelta float64, showResolved bool, showDenied bool) ([]models.Marker, error)
	GetMarkerById(markerId string) (*models.GetMarkerPayload, error)
	CreateMarker(marker models.CreateMarkerBody, userId string, uploadsIds []int64) (int64, bool, error)
	SupportMarker(userId string, markerId int64, amount int64) error
	GetMarkerSupporters(markerId string) ([]models.GetMarkerSupportersResult, error)
	UpsertExternalMarkers(markers []models.CreateMarkerBody) (int64, error)
	AddUploadsToMarker(markerId string, uploadsIds []int64) error
	SetMarkerStatus(markerId string, status string) error
}

type markerRepository struct {
	db *sqlx.DB
}

func NewMarkerRepository(db *sqlx.DB) MarkerRepository {
	return &markerRepository{db: db}
}

func (r *markerRepository) GetMarkersInRegion(latitude float64, longitude float64, latitudeDelta float64, longitudeDelta float64, showResolved bool, showDenied bool) ([]models.Marker, error) {
	var markers []models.Marker
	query := `
		WITH latest_solutions AS (
	SELECT 
		s.markerid, 
		s.verification_status, 
		ROW_NUMBER() OVER (PARTITION BY s.markerid ORDER BY s.approved_at DESC) AS row_num
	FROM 
		solutions s
		)

		SELECT 
				m.id,
				m.lat, 
				m.long, 
				m.mainPhotoId, 
				u.blurhash,
				m.externalobjectid,
				m.solved_at,
				m.status,
				ls.verification_status
		FROM 
				markers m
		LEFT JOIN latest_solutions ls ON m.id = ls.markerid AND ls.row_num = 1
		left JOIN uploads u ON u.id = m.mainPhotoId
		WHERE 
			m.lat >= $1 AND
			m.lat <= $2 AND
			m.long >= $3 AND
			m.long <= $4 AND
			(m.solved_at IS NULL OR $5) AND
			(m.status != 'denied' OR $6);`
	println("Executing query", query)

	fmt.Println("latitude", latitude)
	fmt.Println("longitude", longitude)
	fmt.Println("latitudeDelta", latitudeDelta)

	latMin := latitude - latitudeDelta/2
	latMax := latitude + latitudeDelta/2
	longMin := longitude - longitudeDelta/2
	longMax := longitude + longitudeDelta/2

	fmt.Println("latMin", latMin)
	fmt.Println("latMax", latMax)
	fmt.Println("longMin", longMin)
	fmt.Println("longMax", longMax)
	fmt.Println("ShowResolved", showResolved)
	fmt.Println("ShowDenied", showDenied)

	err := r.db.Select(&markers, query, latMin, latMax, longMin, longMax, showResolved, showDenied)
	return markers, err
}

func (r *markerRepository) GetMarkers() ([]models.Marker, error) {
	var markers []models.Marker
	query := `
	WITH latest_solutions AS (
		SELECT 
			s.markerid, 
			s.verification_status, 
			ROW_NUMBER() OVER (PARTITION BY s.markerid ORDER BY s.approved_at DESC) AS row_num
		FROM 
			solutions s
			)
	
			SELECT 
					m.id,
					m.lat, 
					m.long, 
					m.mainPhotoId, 
					u.blurhash,
					m.externalobjectid,
					m.solved_at,
					m.status,
					ls.verification_status
			FROM 
					markers m
			LEFT JOIN latest_solutions ls ON m.id = ls.markerid AND ls.row_num = 1
			left JOIN uploads u ON u.id = m.mainPhotoId`
	println("Executing queyr", query)
	err := r.db.Select(&markers, query)
	return markers, err
}

func (r *markerRepository) GetMarkerById(markerId string) (*models.GetMarkerPayload, error) {
	var marker models.GetMarkerPayload
	query := `SELECT id, lat, long, userId, points, externalobjectid, solved_at, status FROM markers WHERE id = $1`
	println("Executing query", query, markerId)
	err := r.db.Get(&marker, query, markerId)
	if err != nil {
		return &marker, err
	}

	uploads, err := r.GetMarkerUploads(markerId)
	if err != nil {
		return &marker, err
	}

	marker.FileNamesString = []string{}
	marker.BlurHashes = []string{}
	marker.Confidences = []*float64{}

	for _, upload := range uploads {
		marker.Confidences = append(marker.Confidences, upload.Confidence)
		marker.FileNamesString = append(marker.FileNamesString, strconv.FormatInt(int64(upload.Id), 10))
		marker.BlurHashes = append(marker.BlurHashes, upload.BlurHash)
	}

	return &marker, nil
}

func (r *markerRepository) GetMarkerUploads(markerId string) ([]models.Upload, error) {
	var uploads []models.Upload
	query := `SELECT u.id, u.filename, u.blurhash, rmu.confidence FROM relation_marker_uploads rmu JOIN uploads u ON rmu.uploadId = u.id WHERE rmu.markerId = $1`
	println("Executing query:", query, markerId)
	err := r.db.Select(&uploads, query, markerId)
	return uploads, err
}

func (r *markerRepository) CreateMarker(marker models.CreateMarkerBody, userId string, uploadsIds []int64) (int64, bool, error) {
	data := map[string]interface{}{
		"userId":      userId,
		"lat":         marker.Latitude,
		"long":        marker.Longitude,
		"mainPhotoId": uploadsIds[0],
	}
	query := `
		INSERT INTO markers (userId, lat, long, mainPhotoId, status)
		VALUES (:userId, :lat, :long, :mainPhotoId, 'pending')
		RETURNING id;`

	var markerId int64
	stmt, err := r.db.PrepareNamed(query)
	if err != nil {
		return -1, false, err
	}
	fmt.Println("Executing query:", query)
	err = stmt.Get(&markerId, data)
	if err != nil {
		return -1, false, err
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
		return -1, false, err
	}

	var uploads []struct {
		ID       int64  `db:"id"`
		Filename string `db:"filename"`
	}

	uploadsQuery := `SELECT u.id, u.filename FROM relation_marker_uploads rmu 
                     LEFT JOIN uploads u ON rmu.uploadId = u.id 
                     WHERE rmu.markerId = $1`
	err = r.db.Select(&uploads, uploadsQuery, markerId)
	if err != nil {
		return -1, false, err
	}

	filenames := make([]string, len(uploads))
	for i, upload := range uploads {
		filenames[i] = upload.Filename
	}

	// Marker validation based on images

	isTrashFound, confidences, err := helpers.ValidateImagesWithPython(filenames)
	if err != nil {
		return -1, false, err
	}

	fmt.Println("isTrashFound", isTrashFound)
	fmt.Println("confidences", confidences)

	status := "pending"
	if isTrashFound {
		status = "approved"
	} else {
		status = "denied"
	}

	updateQuery := `UPDATE markers SET status = $1 WHERE id = $2`
	_, err = r.db.Exec(updateQuery, status, markerId)
	if err != nil {
		return -1, false, err
	}

	updateConfidencesQuery := ""
	for i, uploads := range uploads {
		updateConfidencesQuery += fmt.Sprintf(`UPDATE relation_marker_uploads SET confidence = %f WHERE uploadid = %d;`, confidences[i], uploads.ID)
	}
	_, err = r.db.Exec(updateConfidencesQuery)
	if err != nil {
		return -1, false, err
	}

	return markerId, isTrashFound, err
}

func (r *markerRepository) SupportMarker(userId string, markerId int64, amount int64) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}

	if os.Getenv("ENVIRONMENT") != "dev" {
		// Check if user has sufficient points before update
		var currentPoints int64
		checkPointsQuery := `SELECT supportPoints FROM users WHERE id = $1`
		if err := tx.QueryRow(checkPointsQuery, userId).Scan(&currentPoints); err != nil {
			tx.Rollback()
			return err
		}

		if currentPoints < amount {
			tx.Rollback()
			return fmt.Errorf("insufficient points: user has %d points, tried to use %d points", currentPoints, amount)
		}
	}

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

const BATCH_SIZE = 30

func (r *markerRepository) UpsertExternalMarkers(markers []models.CreateMarkerBody) (int64, error) {
	tx, err := r.db.Beginx()
	if err != nil {
		return -1, err
	}

	rows := []string{}
	var rowsTotal int64 = 0
	for idx, marker := range markers {
		rows = append(rows, fmt.Sprintf(`(%f, %f, %d, '%s')`, marker.Latitude, marker.Longitude, *marker.ExternalObjectId, marker.Status))
		if idx%BATCH_SIZE == 0 {
			res, err := tx.Exec(fmt.Sprintf(`INSERT INTO markers (lat, long, externalobjectid, status)
				VALUES %s
				ON CONFLICT (externalobjectid)
				DO UPDATE SET
					lat = EXCLUDED.lat,
					long = EXCLUDED.long
				RETURNING id;`, strings.Join(rows, ",")))

			if err != nil {
				tx.Rollback()
				return -1, err
			}
			rowCount, err := res.RowsAffected()

			if err != nil {
				tx.Rollback()
				return -1, err
			}

			rows = []string{}
			rowsTotal += rowCount
		}
	}

	res, err := tx.Exec(fmt.Sprintf(`INSERT INTO markers (lat, long, externalobjectid, status)
		VALUES %s
		ON CONFLICT (externalobjectid)
		DO UPDATE SET
			lat = EXCLUDED.lat,
			long = EXCLUDED.long
		RETURNING id;`, strings.Join(rows, ",")))

	if err != nil {
		tx.Rollback()
		return -1, err
	}
	rowCount, err := res.RowsAffected()

	if err != nil {
		tx.Rollback()
		return -1, err
	}

	rows = []string{}
	rowsTotal += rowCount

	err = tx.Commit()
	if err != nil {
		return -1, err
	}

	return rowsTotal, nil
}

func (r *markerRepository) AddUploadsToMarker(markerId string, uploadsIds []int64) error {

	rows := []string{}
	for i := 0; i < len(uploadsIds); i++ {
		rows = append(rows, fmt.Sprintf(`(%s, %d)`, markerId, uploadsIds[i]))
	}

	insertedMarkerUploadsRelations := strings.Join(rows, ",")

	query := fmt.Sprintf(`INSERT INTO relation_marker_uploads (markerId, uploadId) VALUES %s`, insertedMarkerUploadsRelations)
	fmt.Println("executing query", query)
	_, err := r.db.Exec(query)
	return err
}

func (r *markerRepository) SetMarkerStatus(markerId string, status string) error {
	query := `UPDATE markers SET status = $1 WHERE id = $2`

	result, err := r.db.Exec(query, status, markerId)
	if err != nil {
		return err
	}

	// Check if any row was actually updated
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("marker with id %s not found", markerId)
	}

	return nil
}
