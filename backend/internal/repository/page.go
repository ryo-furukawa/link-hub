package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/ryo-furukawa/link-hub/internal/model"
)

type PageRepository struct {
	db *sql.DB
}

func NewPageRepository(db *sql.DB) *PageRepository {
	return &PageRepository{db: db}
}

func (r *PageRepository) Create(ctx context.Context, title, description string) (*model.Page, error) {
	id := uuid.NewString()
	now := time.Now().UTC()

	_, err := r.db.ExecContext(ctx, `
		INSERT INTO pages (id, title, description, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?)
	`, id, title, description, now, now)
	if err != nil {
		return nil, fmt.Errorf("create page: %w", err)
	}

	return &model.Page{
		ID:          id,
		Title:       title,
		Description: description,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

func (r *PageRepository) Update(ctx context.Context, id, title, description string) (*model.Page, error) {
	now := time.Now().UTC()

	result, err := r.db.ExecContext(ctx, `
		UPDATE pages SET title=?, description=?, updated_at=? WHERE id=? AND deleted_at IS NULL
	`, title, description, now, id)
	if err != nil {
		return nil, fmt.Errorf("update page: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("update page rows affected: %w", err)
	}
	if rows == 0 {
		return nil, sql.ErrNoRows
	}

	var p model.Page
	err = r.db.QueryRowContext(ctx, `
		SELECT id, title, description, created_at, updated_at
		FROM pages
		WHERE id=? AND deleted_at IS NULL
	`, id).Scan(&p.ID, &p.Title, &p.Description, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("select updated page: %w", err)
	}

	return &p, nil
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

func (r *PageRepository) GetByID(ctx context.Context, id string) (*model.Page, error) {
	var p model.Page
	err := r.db.QueryRowContext(ctx, `
		SELECT id, title, description, created_at, updated_at
		FROM pages
		WHERE id = ? AND deleted_at IS NULL
	`, id).Scan(&p.ID, &p.Title, &p.Description, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("get page by id: %w", err)
	}
	return &p, nil
}
