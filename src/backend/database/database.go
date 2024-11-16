package database

import "github.com/jmoiron/sqlx"

func Connect() (db *sqlx.DB) {
	db, err := sqlx.Connect("postgres", "host=localhost port=5433 user=postgres password=dbpass sslmode=disable")
	if err != nil {
		panic(err)
	}

	return db
}

type SolutionStatus string

const (
	SolutionStatusApproved SolutionStatus = "approved"
	SolutionStatusDenied   SolutionStatus = "denied"
	SolutionStatusPending  SolutionStatus = "pending"
)

type Permission string

const (
	PermissionReviewing Permission = "reviewing"
)

type PointTraceType string

const (
	PointTraceTypeMarkerSupport    PointTraceType = "markerSupport"
	PointTraceTypeMarkerReward     PointTraceType = "markerReward"
	PointTraceTypeMarkerRewardUndo PointTraceType = "markerRewardUndo"
	PointTraceTypeSystem           PointTraceType = "system"
)
