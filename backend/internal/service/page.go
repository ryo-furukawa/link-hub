package service

import (
	"context"

	"github.com/ryo-furukawa/link-hub/internal/model"
	"github.com/ryo-furukawa/link-hub/internal/repository"
)

type PageService struct {
	repo *repository.PageRepository
}

func NewPageService(repo *repository.PageRepository) *PageService {
	return &PageService{repo: repo}
}

func (s *PageService) List(ctx context.Context) ([]model.Page, error) {
	return s.repo.List(ctx)
}

func (s *PageService) Create(ctx context.Context, title, description string) (*model.Page, error) {
	return s.repo.Create(ctx, title, description)
}

func (s *PageService) GetByID(ctx context.Context, id string) (*model.Page, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *PageService) Update(ctx context.Context, id, title, description string) (*model.Page, error) {
	return s.repo.Update(ctx, id, title, description)
}

func (s *PageService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *PageService) Restore(ctx context.Context, id string) error {
	return s.repo.Restore(ctx, id)
}
