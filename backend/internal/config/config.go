package config

import "os"

type Config struct {
	Addr   string
	DBPath string
}

func Load() Config {
	addr := getEnv("Port", ":8080")

	if addr != "" && addr[0] != ':' && !hasHost(addr) {
		addr = ":" + addr
	}

	return Config{
		Addr:   addr,
		DBPath: getEnv("DB_PATH", "linkhub.db"),
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
