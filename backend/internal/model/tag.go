package model

import "time"

type Tag struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

type PageTag struct {
	PageID string `json:"page_id"`
	TagID  string `json:"tag_id"`
}
