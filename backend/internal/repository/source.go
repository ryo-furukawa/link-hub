package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/ryo-furukawa/link-hub/internal/model"
)

type SourceRepository struct {
	db *sql.DB
}

func NewSourceRepository(db *sql.DB) *SourceRepository {
	return &SourceRepository{db: db}
}

func (r *SourceRepository) Create(ctx context.Context, pageID string, sectionID *string, sourceType string, url *string, title string, memo *string, content *string) (*model.Source, error) {
	id := uuid.NewString()
	now := time.Now().UTC()

	_, err := r.db.ExecContext(ctx, `
		INSERT INTO sources (id, page_id, section_id, type, url, title, memo, content, position, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
	`, id, pageID, sectionID, sourceType, url, title, memo, content, now, now)
	if err != nil {
		return nil, fmt.Errorf("create source: %w", err)
	}

	return &model.Source{
		ID:        id,
		PageID:    pageID,
		SectionID: sectionID,
		Type:      sourceType,
		URL:       url,
		Title:     title,
		Memo:      memo,
		Content:   content,
		Position:  0,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

func (r *SourceRepository) ListByPageID(ctx context.Context, pageID string) ([]model.Source, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, page_id, section_id, type, url, title, memo, content, position, created_at, updated_at
		FROM sources
		WHERE page_id = ?
		ORDER BY position ASC
	`, pageID)
	if err != nil {
		return nil, fmt.Errorf("list sources: %w", err)
	}
	defer rows.Close()

	var sources []model.Source
	for rows.Next() {
		var s model.Source
		if err := rows.Scan(&s.ID, &s.PageID, &s.SectionID, &s.Type, &s.URL, &s.Title, &s.Memo, &s.Content, &s.Position, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan source: %w", err)
		}
		sources = append(sources, s)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return sources, nil
}

func (r *SourceRepository) Update(ctx context.Context, id, title string, memo *string, content *string, sectionID *string) (*model.Source, error) {
	now := time.Now().UTC()

	result, err := r.db.ExecContext(ctx, `
		UPDATE sources SET title=?, memo=?, content=?, section_id=?, updated_at=? WHERE id=?
	`, title, memo, content, sectionID, now, id)
	if err != nil {
		return nil, fmt.Errorf("update source: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("update source rows affected: %w", err)
	}
	if rows == 0 {
		return nil, sql.ErrNoRows
	}

	var s model.Source
	err = r.db.QueryRowContext(ctx, `
		SELECT id, page_id, section_id, type, url, title, memo, content, position, created_at, updated_at
		FROM sources
		WHERE id=?
	`, id).Scan(&s.ID, &s.PageID, &s.SectionID, &s.Type, &s.URL, &s.Title, &s.Memo, &s.Content, &s.Position, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("select updated source: %w", err)
	}

	return &s, nil
}

func (r *SourceRepository) Delete(ctx context.Context, id string) error {
	result, err := r.db.ExecContext(ctx, `
		DELETE FROM sources WHERE id=?
	`, id)
	if err != nil {
		return fmt.Errorf("delete source: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("delete source rows affected: %w", err)
	}
	if affected == 0 {
		return sql.ErrNoRows
	}

	return nil
}
