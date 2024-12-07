package tests

import (
	repositories "backend/repository"
	"testing"
	"time"
)

func TestStartOfWeek(t *testing.T) {
	tests := []struct {
		name    string
		mockNow time.Time
		want    time.Time
	}{
		{
			name:    "Monday",
			mockNow: time.Date(2024, 3, 4, 15, 30, 45, 0, time.UTC),
			want:    time.Date(2024, 3, 4, 0, 0, 0, 0, time.UTC),
		},
		{
			name:    "Wednesday",
			mockNow: time.Date(2024, 3, 6, 10, 20, 30, 0, time.UTC),
			want:    time.Date(2024, 3, 4, 0, 0, 0, 0, time.UTC),
		},
		{
			name:    "Sunday",
			mockNow: time.Date(2024, 3, 10, 23, 59, 59, 0, time.UTC),
			want:    time.Date(2024, 3, 4, 0, 0, 0, 0, time.UTC),
		},
		{
			name:    "Month boundary",
			mockNow: time.Date(2024, 3, 31, 23, 59, 59, 0, time.UTC),
			want:    time.Date(2024, 3, 25, 0, 0, 0, 0, time.UTC),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repositories.CurrentTime = func() time.Time {
				return tt.mockNow
			}

			got := repositories.StartOfWeek()
			if !got.Equal(tt.want) {
				t.Errorf("startOfWeek() = %v, want %v", got, tt.want)
			}
		})
	}
}
