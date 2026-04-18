package service

import (
	"context"

	"github.com/ryo-furukawa/link-hub/internal/model"
	"github.com/ryo-furukawa/link-hub/internal/repository"
)

type TagService struct {
	repo *repository.TagRepository
}

func NewTagService(repo *repository.TagRepository) *TagService {
	return &TagService{repo: repo}
}

func (s *TagService) List(ctx context.Context) ([]model.Tag, error) {
	return s.repo.List(ctx)
}

func (s *TagService) Create(ctx context.Context, name string) (*model.Tag, error) {
	return s.repo.Create(ctx, name)
}

func (s *TagService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *TagService) ListByPageID(ctx context.Context, pageID string) ([]model.Tag, error) {
	return s.repo.ListByPageID(ctx, pageID)
}

func (s *TagService) AttachToPage(ctx context.Context, pageID, tagID string) error {
	return s.repo.AttachToPage(ctx, pageID, tagID)
}

func (s *TagService) DetachFromPage(ctx context.Context, pageID, tagID string) error {
	return s.repo.DetachFromPage(ctx, pageID, tagID)
}
