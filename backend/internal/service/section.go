package service

import (
	"context"

	"github.com/ryo-furukawa/link-hub/internal/model"
	"github.com/ryo-furukawa/link-hub/internal/repository"
)

type SectionService struct {
	repo *repository.SectionRepository
}

func NewSectionService(repo *repository.SectionRepository) *SectionService {
	return &SectionService{repo: repo}
}

func (s *SectionService) Create(ctx context.Context, pageID, name string) (*model.Section, error) {
	return s.repo.Create(ctx, pageID, name)
}

func (s *SectionService) ListByPageID(ctx context.Context, pageID string) ([]model.Section, error) {
	return s.repo.ListByPageID(ctx, pageID)
}

func (s *SectionService) Update(ctx context.Context, id, name string) (*model.Section, error) {
	return s.repo.Update(ctx, id, name)
}

func (s *SectionService) Reorder(ctx context.Context, sectionIDs []string) error {
	return s.repo.Reorder(ctx, sectionIDs)
}

func (s *SectionService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
