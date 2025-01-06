package models

import "time"

type Upload struct {
	Id       int64  `json:"id"`
	Filename string `json:"filename"`
	BlurHash string `json:"blurHash"`
}

type SolutionUpload struct {
	Upload
	UploadType string `json:"uploadType" db:"uploadtype"`
}

type Marker struct {
	Id                 int64   `json:"id"`
	Lat                float64 `json:"lat"`
	Long               float64 `json:"long"`
	MainPhotoId        *int64  `json:"mainPhotoId"`
	Blurhash           *string `json:"blurhash"`
	VerificationStatus *string `json:"verificationStatus" db:"verification_status"`
	ExternalObjectId   *int64  `json:"externalObjectId" db:"externalobjectid"`
}

type GetMarkerPayload struct {
	Id                        int64      `json:"id"`
	Lat                       float64    `json:"lat"`
	Long                      float64    `json:"long"`
	FileNamesString           []string   `json:"fileNamesString"`
	BlurHashes                []string   `json:"blurHashes"`
	UserId                    *string    `json:"userId"`
	Points                    int64      `json:"points"`
	PendingVerificationsCount int64      `json:"pendingVerificationsCount"` // -1 if approved else ++
	LatestSolutionId          int64      `json:"latestSolutionId"`
	ExternalObjectId          *int64     `json:"externalObjectId" db:"externalobjectid"`
	Status                    string     `json:"status" db:"status"`
	SolvedAt                  *time.Time `json:"solvedAt" db:"solved_at"`
}

type CreateMarkerBody struct {
	Latitude         float64 `json:"latitude"`
	Longitude        float64 `json:"longitude"`
	ExternalObjectId *int64  `json:"ObjectId"`
	Status           string  `json:"status"`
}

type GetMarkerSupportersResult struct {
	Id              string  `json:"id"`
	Username        string  `json:"username"`
	Total           int64   `json:"total"`
	ProfileImageUrl *string `json:"profileImageUrl"`
}

type LatestSolutionPayload struct {
	PendingVerificationsCount int64 `json:"pendingVerificationsCount"` // -1 if approved else ++
	LatestSolutionId          int64 `json:"latestSolutionId"`
}

// Define a struct for participants
type Participant struct {
	UserId string `db:"id" json:"userId"`
}

type User struct {
	Id              string `json:"id"`
	Username        string `json:"username"`
	Points          int64  `json:"points"`
	SupportPoints   int64  `json:"supportPoints"`
	ProfileImageURL string `json:"profileImageURL"`
}

type LeaderboardEntry struct {
	UserId         string `json:"userId"`
	Username       string `json:"username"`
	NumberOfPoints int64  `json:"numberOfPoints"`
	ImageUrl       string `json:"imageUrl"`
}

type LeaderboardType string

const (
	Weekly  LeaderboardType = "weekly"
	Monthly LeaderboardType = "monthly"
	AllTime LeaderboardType = "alltime"
)
