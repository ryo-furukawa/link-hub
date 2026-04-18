package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/ryo-furukawa/link-hub/internal/model"
)

type SectionRepository struct {
	db *sql.DB
}

func NewSectionRepository(db *sql.DB) *SectionRepository {
	return &SectionRepository{db: db}
}

func (r *SectionRepository) Create(ctx context.Context, pageID, name string) (*model.Section, error) {
	id := uuid.NewString()
	now := time.Now().UTC()

	_, err := r.db.ExecContext(ctx, `
		INSERT INTO sections (id, page_id, name, position, created_at, updated_at)
		VALUES (?, ?, ?, 0, ?, ?)
	`, id, pageID, name, now, now)
	if err != nil {
		return nil, fmt.Errorf("create section: %w", err)
	}

	return &model.Section{
		ID:        id,
		PageID:    pageID,
		Name:      name,
		Position:  0,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

func (r *SectionRepository) ListByPageID(ctx context.Context, pageID string) ([]model.Section, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, page_id, name, position, created_at, updated_at
		FROM sections
		WHERE page_id = ?
		ORDER BY position ASC
	`, pageID)
	if err != nil {
		return nil, fmt.Errorf("list sections: %w", err)
	}
	defer rows.Close()

	var sections []model.Section
	for rows.Next() {
		var s model.Section
		if err := rows.Scan(&s.ID, &s.PageID, &s.Name, &s.Position, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan section: %w", err)
		}
		sections = append(sections, s)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return sections, nil
}

func (r *SectionRepository) Update(ctx context.Context, id, name string) (*model.Section, error) {
	now := time.Now().UTC()

	result, err := r.db.ExecContext(ctx, `
		UPDATE sections SET name=?, updated_at=? WHERE id=?
	`, name, now, id)
	if err != nil {
		return nil, fmt.Errorf("update section: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("update section rows affected: %w", err)
	}
	if rows == 0 {
		return nil, sql.ErrNoRows
	}

	var s model.Section
	err = r.db.QueryRowContext(ctx, `
		SELECT id, page_id, name, position, created_at, updated_at
		FROM sections
		WHERE id=?
	`, id).Scan(&s.ID, &s.PageID, &s.Name, &s.Position, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("select updated section: %w", err)
	}

	return &s, nil
}

func (r *SectionRepository) Reorder(ctx context.Context, sectionIDs []string) error {
	now := time.Now().UTC()
	for i, id := range sectionIDs {
		_, err := r.db.ExecContext(ctx, `UPDATE sections SET position=?, updated_at=? WHERE id=?`, i, now, id)
		if err != nil {
			return fmt.Errorf("reorder section: %w", err)
		}
	}
	return nil
}

func (r *SectionRepository) Delete(ctx context.Context, id string) error {
	result, err := r.db.ExecContext(ctx, `
		DELETE FROM sections WHERE id=?
	`, id)
	if err != nil {
		return fmt.Errorf("delete section: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("delete section rows affected: %w", err)
	}
	if affected == 0 {
		return sql.ErrNoRows
	}

	return nil
}
