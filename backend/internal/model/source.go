package model

import "time"

type Source struct {
	ID        string    `json:"id"`
	PageID    string    `json:"page_id"`
	SectionID *string   `json:"section_id"`
	Type      string    `json:"type"`
	URL       *string   `json:"url"`
	Title     string    `json:"title"`
	Memo      *string   `json:"memo"`
	Content   *string   `json:"content"`
	Position  int       `json:"position"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
