package model

import "time"

type Section struct {
	ID        string    `json:"id"`
	PageID    string    `json:"page_id"`
	Name      string    `json:"name"`
	Position  int       `json:"position"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
