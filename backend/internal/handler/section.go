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

type SectionHandler struct {
	svc *service.SectionService
}

func NewSectionHandler(svc *service.SectionService) *SectionHandler {
	return &SectionHandler{svc: svc}
}

func (h *SectionHandler) Create(w http.ResponseWriter, r *http.Request) {
	pageID := r.PathValue("id")

	var req struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.Name) == "" {
		http.Error(w, `{"error":"name is required"}`, http.StatusBadRequest)
		return
	}

	section, err := h.svc.Create(r.Context(), pageID, req.Name)
	if err != nil {
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(section)
}

func (h *SectionHandler) List(w http.ResponseWriter, r *http.Request) {
	pageID := r.PathValue("id")

	sections, err := h.svc.ListByPageID(r.Context(), pageID)
	if err != nil {
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	if sections == nil {
		sections = []model.Section{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sections)
}

func (h *SectionHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var req struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.Name) == "" {
		http.Error(w, `{"error":"name is required"}`, http.StatusBadRequest)
		return
	}

	section, err := h.svc.Update(r.Context(), id, req.Name)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(section)
}

func (h *SectionHandler) Delete(w http.ResponseWriter, r *http.Request) {
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
