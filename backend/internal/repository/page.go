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
		VALUES ($1, $2, $3, $4, $5)
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
		UPDATE pages SET title=$1, description=$2, updated_at=$3 WHERE id=$4 AND deleted_at IS NULL
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
		WHERE id=$1 AND deleted_at IS NULL
	`, id).Scan(&p.ID, &p.Title, &p.Description, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("select updated page: %w", err)
	}

	return &p, nil
}

func (r *PageRepository) List(ctx context.Context) ([]model.Page, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT p.id, p.title, p.description, p.created_at, p.updated_at,
		       t.id, t.name, t.created_at
		FROM pages p
		LEFT JOIN page_tags pt ON pt.page_id = p.id
		LEFT JOIN tags t ON t.id = pt.tag_id
		WHERE p.deleted_at IS NULL
		ORDER BY p.created_at DESC, t.name
	`)
	if err != nil {
		return nil, fmt.Errorf("list pages: %w", err)
	}
	defer rows.Close()

	pageMap := make(map[string]*model.Page)
	var order []string

	for rows.Next() {
		var p model.Page
		var tagID, tagName sql.NullString
		var tagCreatedAt sql.NullTime
		if err := rows.Scan(&p.ID, &p.Title, &p.Description, &p.CreatedAt, &p.UpdatedAt, &tagID, &tagName, &tagCreatedAt); err != nil {
			return nil, fmt.Errorf("scan page: %w", err)
		}
		if _, exists := pageMap[p.ID]; !exists {
			p.Tags = []model.Tag{}
			pageMap[p.ID] = &p
			order = append(order, p.ID)
		}
		if tagID.Valid {
			pageMap[p.ID].Tags = append(pageMap[p.ID].Tags, model.Tag{
				ID:        tagID.String,
				Name:      tagName.String,
				CreatedAt: tagCreatedAt.Time,
			})
		}
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	pages := make([]model.Page, 0, len(order))
	for _, id := range order {
		pages = append(pages, *pageMap[id])
	}
	return pages, nil
}

func (r *PageRepository) GetByID(ctx context.Context, id string) (*model.Page, error) {
	var p model.Page
	err := r.db.QueryRowContext(ctx, `
		SELECT id, title, description, created_at, updated_at
		FROM pages
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(&p.ID, &p.Title, &p.Description, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("get page by id: %w", err)
	}
	return &p, nil
}

func (r *PageRepository) Delete(ctx context.Context, id string) error {
	now := time.Now().UTC()
	result, err := r.db.ExecContext(ctx, `
		UPDATE pages SET deleted_at=$1 WHERE id=$2 AND deleted_at IS NULL
	`, now, id)
	if err != nil {
		return fmt.Errorf("delete page: %w", err)
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("delete page rows affected: %w", err)
	}
	if affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *PageRepository) Restore(ctx context.Context, id string) error {
	now := time.Now().UTC()
	result, err := r.db.ExecContext(ctx, `
		UPDATE pages SET deleted_at=NULL, updated_at=$1 WHERE id=$2 AND deleted_at IS NOT NULL
	`, now, id)
	if err != nil {
		return fmt.Errorf("restore page: %w", err)
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("restore page rows affected: %w", err)
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}
