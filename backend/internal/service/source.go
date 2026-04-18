package service

import (
	"context"

	"github.com/ryo-furukawa/link-hub/internal/model"
	"github.com/ryo-furukawa/link-hub/internal/repository"
)

type SourceService struct {
	repo *repository.SourceRepository
}

func NewSourceService(repo *repository.SourceRepository) *SourceService {
	return &SourceService{repo: repo}
}

func (s *SourceService) Create(ctx context.Context, pageID string, sectionID *string, sourceType string, url *string, title string, memo *string, content *string) (*model.Source, error) {
	return s.repo.Create(ctx, pageID, sectionID, sourceType, url, title, memo, content)
}

func (s *SourceService) ListByPageID(ctx context.Context, pageID string) ([]model.Source, error) {
	return s.repo.ListByPageID(ctx, pageID)
}

func (s *SourceService) Update(ctx context.Context, id, title string, memo *string, content *string, sectionID *string) (*model.Source, error) {
	return s.repo.Update(ctx, id, title, memo, content, sectionID)
}

func (s *SourceService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
