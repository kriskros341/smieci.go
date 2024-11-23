package database

import (
	"fmt"

	"github.com/jmoiron/sqlx"
)

func Connect(host string) (db *sqlx.DB) {
	datasource := fmt.Sprintf("host=%s port=5432 user=postgres password=dbpass sslmode=disable", host)
	db, err := sqlx.Connect("postgres", datasource)
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
