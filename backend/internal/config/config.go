package config

import "os"

type Config struct {
	Addr           string
	DatabaseURL    string
	MigrationsPath string
}

func Load() Config {
	addr := getEnv("PORT", ":8080")

	if addr != "" && addr[0] != ':' && !hasHost(addr) {
		addr = ":" + addr
	}

	return Config{
		Addr:           addr,
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://linkhub:linkhub@localhost:5432/linkhub?sslmode=disable"),
		MigrationsPath: getEnv("MIGRATIONS_PATH", "migrations"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func hasHost(port string) bool {
	for i := 0; i < len(port); i++ {
		if port[i] == ':' {
			return true
		}
	}
	return false
}
