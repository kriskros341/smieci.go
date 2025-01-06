package repositories

import (
	"backend/helpers"
	"backend/models"
	"fmt"
	"mime/multipart"
	"os"
	"strings"

	"github.com/jmoiron/sqlx"
)

type UploadsRepository interface {
	GetUploadsByMarkerId(markerId string) ([]models.Upload, error)
	GetUploadsBySolutionId(solutionId int) ([]models.SolutionUpload, error)
	CreateUploadsFromHeaders(headers []*multipart.FileHeader) ([]int64, error)
	FilterMarkerUploads(markerKey string, uploadsIds []string) error
	GetPathForUploadById(uploadId string) (path string, err error)
}

type uploadsRepository struct {
	db *sqlx.DB
}

func NewUploadsRepository(db *sqlx.DB) UploadsRepository {
	return &uploadsRepository{db: db}
}

func (r *uploadsRepository) GetPathForUploadById(uploadId string) (path string, err error) {
	// query db for upload with said id
	query := "SELECT filename FROM uploads WHERE id = $1"
	fmt.Println("Executing query:", query, "with uploadId:", uploadId)
	var fileName string
	if err := r.db.Get(&fileName, query, uploadId); err != nil {
		return "", err
	}
	// create path and read file
	filePath := fmt.Sprintf(`%s%s`, helpers.UPLOADS_FOLDER, fileName)
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return "", err
	}

	return filePath, nil
}

func (r *uploadsRepository) GetUploadsByMarkerId(markerID string) ([]models.Upload, error) {
	var uploads []models.Upload
	query := `
		SELECT up.id, up.filename, up.blurhash 
		FROM uploads up 
		JOIN relation_marker_uploads rmu ON up.id = rmu.uploadId 
		WHERE rmu.markerId = $1`
	err := r.db.Select(&uploads, query, markerID)
	return uploads, err
}

func (r *uploadsRepository) GetUploadsBySolutionId(solutionId int) ([]models.SolutionUpload, error) {
	var uploads []models.SolutionUpload
	// get associated uploads
	query := fmt.Sprintf(`
		select uploads.id, filename, blurhash, uploadtype FROM solutions_uploads_relation supr
		join uploads on supr.uploadId = uploads.id
		WHERE supr.solutionId = %d;
		`, solutionId)
	fmt.Printf("executing query: %s", query)
	err := r.db.Select(&uploads, query)
	if err != nil {
		return nil, err
	}
	return uploads, nil
}

func (r *uploadsRepository) CreateUploadsFromHeaders(headers []*multipart.FileHeader) ([]int64, error) {

	fileNames, blurHashes, fileProcessingErrors := helpers.ProcessFiles(headers)

	for err := range fileProcessingErrors {
		if err != nil {
			return nil, err
		}
	}

	rows := []string{}
	for i := 0; i < len(fileNames); i++ {
		rows = append(rows, fmt.Sprintf(`('%s', '%s')`, fileNames[i], blurHashes[i]))
	}

	if len(rows) == 0 {
		return []int64{}, nil
	}
	filesQuery := fmt.Sprintf(`INSERT INTO uploads (filename, blurHash) VALUES %s RETURNING id`, strings.Join(rows, ","))
	fmt.Println("Executing query:", filesQuery)
	resultRows, err := r.db.Queryx(filesQuery)
	if err != nil {
		return nil, err
	}
	defer resultRows.Close()

	// Collect IDs of the inserted rows
	var ids []int64
	for resultRows.Next() {
		var id int64
		if err := resultRows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, nil
}

func (r *uploadsRepository) FilterMarkerUploads(markerKey string, uploadsIds []string) error {
	if len(uploadsIds) == 0 {
		return nil
	}

	query, args, err := sqlx.In("DELETE FROM relation_marker_uploads rmu WHERE rmu.markerid = ? AND rmu.uploadid NOT IN (?)", markerKey, uploadsIds)

	println("executing", query, "with", args)
	query = r.db.Rebind(query)
	_, err = r.db.Exec(query, args...)

	return err
}
