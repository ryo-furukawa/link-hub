package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/ryo-furukawa/link-hub/internal/model"
)

type TagRepository struct {
	db *sql.DB
}

func NewTagRepository(db *sql.DB) *TagRepository {
	return &TagRepository{db: db}
}

func (r *TagRepository) List(ctx context.Context) ([]model.Tag, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT id, name, created_at FROM tags ORDER BY name`)
	if err != nil {
		return nil, fmt.Errorf("tag list: %w", err)
	}
	defer rows.Close()

	var tags []model.Tag
	for rows.Next() {
		var t model.Tag
		if err := rows.Scan(&t.ID, &t.Name, &t.CreatedAt); err != nil {
			return nil, fmt.Errorf("tag scan: %w", err)
		}
		tags = append(tags, t)
	}
	return tags, nil
}

func (r *TagRepository) Create(ctx context.Context, name string) (*model.Tag, error) {
	id := uuid.NewString()
	now := time.Now().UTC()

	_, err := r.db.ExecContext(ctx, `INSERT INTO tags (id, name, created_at) VALUES (?, ?, ?)`, id, name, now)
	if err != nil {
		return nil, fmt.Errorf("tag create: %w", err)
	}
	return &model.Tag{ID: id, Name: name, CreatedAt: now}, nil
}

func (r *TagRepository) Delete(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, `DELETE FROM tags WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("tag delete: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *TagRepository) ListByPageID(ctx context.Context, pageID string) ([]model.Tag, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT t.id, t.name, t.created_at
		FROM tags t
		INNER JOIN page_tags pt ON pt.tag_id = t.id
		WHERE pt.page_id = ?
		ORDER BY t.name
	`, pageID)
	if err != nil {
		return nil, fmt.Errorf("page tags list: %w", err)
	}
	defer rows.Close()

	var tags []model.Tag
	for rows.Next() {
		var t model.Tag
		if err := rows.Scan(&t.ID, &t.Name, &t.CreatedAt); err != nil {
			return nil, fmt.Errorf("page tag scan: %w", err)
		}
		tags = append(tags, t)
	}
	return tags, nil
}

func (r *TagRepository) AttachToPage(ctx context.Context, pageID, tagID string) error {
	_, err := r.db.ExecContext(ctx, `INSERT OR IGNORE INTO page_tags (page_id, tag_id) VALUES (?, ?)`, pageID, tagID)
	if err != nil {
		return fmt.Errorf("attach tag: %w", err)
	}
	return nil
}

func (r *TagRepository) DetachFromPage(ctx context.Context, pageID, tagID string) error {
	res, err := r.db.ExecContext(ctx, `DELETE FROM page_tags WHERE page_id = ? AND tag_id = ?`, pageID, tagID)
	if err != nil {
		return fmt.Errorf("detach tag: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}
