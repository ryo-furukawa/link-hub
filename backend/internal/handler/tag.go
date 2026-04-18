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

type TagHandler struct {
	svc *service.TagService
}

func NewTagHandler(svc *service.TagService) *TagHandler {
	return &TagHandler{svc: svc}
}

func (h *TagHandler) List(w http.ResponseWriter, r *http.Request) {
	tags, err := h.svc.List(r.Context())
	if err != nil {
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}
	if tags == nil {
		tags = []model.Tag{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tags)
}

func (h *TagHandler) Create(w http.ResponseWriter, r *http.Request) {
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

	tag, err := h.svc.Create(r.Context(), req.Name)
	if err != nil {
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(tag)
}

func (h *TagHandler) Delete(w http.ResponseWriter, r *http.Request) {
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

func (h *TagHandler) ListByPage(w http.ResponseWriter, r *http.Request) {
	pageID := r.PathValue("id")

	tags, err := h.svc.ListByPageID(r.Context(), pageID)
	if err != nil {
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}
	if tags == nil {
		tags = []model.Tag{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tags)
}

func (h *TagHandler) AttachToPage(w http.ResponseWriter, r *http.Request) {
	pageID := r.PathValue("id")

	var req struct {
		TagID string `json:"tag_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}
	if req.TagID == "" {
		http.Error(w, `{"error":"tag_id is required"}`, http.StatusBadRequest)
		return
	}

	if err := h.svc.AttachToPage(r.Context(), pageID, req.TagID); err != nil {
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *TagHandler) DetachFromPage(w http.ResponseWriter, r *http.Request) {
	pageID := r.PathValue("id")
	tagID := r.PathValue("tagId")

	if err := h.svc.DetachFromPage(r.Context(), pageID, tagID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
