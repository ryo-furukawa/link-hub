package main

import (
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/ryo-furukawa/link-hub/internal/config"
	"github.com/ryo-furukawa/link-hub/internal/db"
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

	mux := http.NewServeMux()
	// ヘルスチェック
	mux.HandleFunc("GET /healthz", healthHandler)

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
