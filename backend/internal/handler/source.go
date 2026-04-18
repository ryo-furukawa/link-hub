package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/ryo-furukawa/link-hub/internal/model"
	"github.com/ryo-furukawa/link-hub/internal/service"
)

type SourceHandler struct {
	svc *service.SourceService
}

func NewSourceHandler(svc *service.SourceService) *SourceHandler {
	return &SourceHandler{svc: svc}
}

func (h *SourceHandler) Create(w http.ResponseWriter, r *http.Request) {
	pageID := r.PathValue("id")

	var req struct {
		SectionID *string `json:"section_id"`
		Type      string  `json:"type"`
		URL       *string `json:"url"`
		Title     string  `json:"title"`
		Memo      *string `json:"memo"`
		Content   *string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.Title) == "" {
		http.Error(w, `{"error":"title is required"}`, http.StatusBadRequest)
		return
	}
	if req.Type != "link" && req.Type != "note" {
		http.Error(w, `{"error":"type must be link or note"}`, http.StatusBadRequest)
		return
	}

	source, err := h.svc.Create(r.Context(), pageID, req.SectionID, req.Type, req.URL, req.Title, req.Memo, req.Content)
	if err != nil {
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(source)
}

func (h *SourceHandler) List(w http.ResponseWriter, r *http.Request) {
	pageID := r.PathValue("id")

	sources, err := h.svc.ListByPageID(r.Context(), pageID)
	if err != nil {
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	if sources == nil {
		sources = []model.Source{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sources)
}

func (h *SourceHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var req struct {
		Title     string  `json:"title"`
		Memo      *string `json:"memo"`
		Content   *string `json:"content"`
		SectionID *string `json:"section_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.Title) == "" {
		http.Error(w, `{"error":"title is required"}`, http.StatusBadRequest)
		return
	}

	source, err := h.svc.Update(r.Context(), id, req.Title, req.Memo, req.Content, req.SectionID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(source)
}

func (h *SourceHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	if err := h.svc.Delete(r.Context(), id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
