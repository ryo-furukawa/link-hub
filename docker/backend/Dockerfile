FROM golang:1.26-alpine

WORKDIR /app

# air をインストール（ホットリロード用）
RUN go install github.com/air-verse/air@latest

EXPOSE 8080

CMD ["air", "-c", ".air.toml"]
