package main

import (
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/ryo-furukawa/link-hub/internal/config"
	"github.com/ryo-furukawa/link-hub/internal/db"
	"github.com/ryo-furukawa/link-hub/internal/handler"
	"github.com/ryo-furukawa/link-hub/internal/repository"
	"github.com/ryo-furukawa/link-hub/internal/service"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	slog.SetDefault(logger)

	cfg := config.Load()

	database, err := db.OpenSQLite(cfg.DBPath)
	if err != nil {
		logger.Error("db open failed", "error", err)
		os.Exit(1)
	}
	defer database.Close()

	logger.Info("db connected", "path", cfg.DBPath)

	if err := db.RunMigrations(database, cfg.MigrationsPath); err != nil {
		logger.Error("migration failed", "error", err)
		os.Exit(1)
	}
	logger.Info("migration done")

	pageRepo := repository.NewPageRepository(database)
	pageSvc := service.NewPageService(pageRepo)
	pageHandler := handler.NewPageHandler(pageSvc)

	sourceRepo := repository.NewSourceRepository(database)
	sourceSvc := service.NewSourceService(sourceRepo)
	sourceHandler := handler.NewSourceHandler(sourceSvc)

	sectionRepo := repository.NewSectionRepository(database)
	sectionSvc := service.NewSectionService(sectionRepo)
	sectionHandler := handler.NewSectionHandler(sectionSvc)

	tagRepo := repository.NewTagRepository(database)
	tagSvc := service.NewTagService(tagRepo)
	tagHandler := handler.NewTagHandler(tagSvc)

	mux := http.NewServeMux()
	// ヘルスチェック
	mux.HandleFunc("GET /healthz", healthHandler)
	// pages
	mux.HandleFunc("GET /api/pages", pageHandler.List)
	mux.HandleFunc("POST /api/pages", pageHandler.Create)
	mux.HandleFunc("GET /api/pages/{id}", pageHandler.Get)
	mux.HandleFunc("PATCH /api/pages/{id}", pageHandler.Update)
	mux.HandleFunc("DELETE /api/pages/{id}", pageHandler.Delete)
	mux.HandleFunc("PATCH /api/pages/{id}/restore", pageHandler.Restore)
	// sections
	mux.HandleFunc("GET /api/pages/{id}/sections", sectionHandler.List)
	mux.HandleFunc("POST /api/pages/{id}/sections", sectionHandler.Create)
	mux.HandleFunc("PATCH /api/sections/{id}", sectionHandler.Update)
	mux.HandleFunc("DELETE /api/sections/{id}", sectionHandler.Delete)
	mux.HandleFunc("PATCH /api/pages/{id}/sections/reorder", sectionHandler.Reorder)
	// sources
	mux.HandleFunc("GET /api/pages/{id}/sources", sourceHandler.List)
	mux.HandleFunc("POST /api/pages/{id}/sources", sourceHandler.Create)
	mux.HandleFunc("PATCH /api/sources/{id}", sourceHandler.Update)
	mux.HandleFunc("DELETE /api/sources/{id}", sourceHandler.Delete)
	mux.HandleFunc("PATCH /api/sources/{id}/position", sourceHandler.UpdatePosition)
	mux.HandleFunc("PATCH /api/pages/{id}/sources/reorder", sourceHandler.Reorder)
	// tags
	mux.HandleFunc("GET /api/tags", tagHandler.List)
	mux.HandleFunc("POST /api/tags", tagHandler.Create)
	mux.HandleFunc("DELETE /api/tags/{id}", tagHandler.Delete)
	mux.HandleFunc("GET /api/pages/{id}/tags", tagHandler.ListByPage)
	mux.HandleFunc("POST /api/pages/{id}/tags", tagHandler.AttachToPage)
	mux.HandleFunc("DELETE /api/pages/{id}/tags/{tagId}", tagHandler.DetachFromPage)

	server := &http.Server{
		Addr:         cfg.Addr,
		Handler:      mux,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	logger.Info("server starting", "addr", server.Addr)

	if err := server.ListenAndServe(); err != nil {
		logger.Error("server failed", "error", err)
		os.Exit(1)
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}
