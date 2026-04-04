package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/ryo-furukawa/link-hub/internal/model"
)

type PageRepository struct {
	db *sql.DB
}

func NewPageRepository(db *sql.DB) *PageRepository {
	return &PageRepository{db: db}
}

func (r *PageRepository) List(ctx context.Context) ([]model.Page, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, title, description, created_at, updated_at
		FROM pages
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("list pages: %w", err)
	}
	defer rows.Close()

	var pages []model.Page
	for rows.Next() {
		var p model.Page
		if err := rows.Scan(&p.ID, &p.Title, &p.Description, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan page: %w", err)
		}
		pages = append(pages, p)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return pages, nil
}
