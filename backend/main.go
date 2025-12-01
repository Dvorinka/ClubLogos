package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func main() {
	// Initialize database
	var err error
	db, err = initDB()
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer db.Close()

	// Create logos directory if it doesn't exist
	if err := os.MkdirAll("./logos", 0755); err != nil {
		log.Fatal("Failed to create logos directory:", err)
	}

	// Create subdirectories for SVG and PNG
	if err := os.MkdirAll("./logos/svg", 0755); err != nil {
		log.Fatal("Failed to create logos/svg directory:", err)
	}
	if err := os.MkdirAll("./logos/png", 0755); err != nil {
		log.Fatal("Failed to create logos/png directory:", err)
	}

	// Initialize Gin router with larger request size limit (32MB)
	r := gin.Default()
	r.MaxMultipartMemory = 32 << 20 // 32 MB

	// CORS middleware - Allow all origins, methods, and headers
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With", "Range", "Accept-Language", "Accept-Encoding", "Cache-Control", "Pragma", "If-Modified-Since"},
		ExposeHeaders:    []string{"*"},
		AllowCredentials: false,
		AllowOriginFunc:  func(origin string) bool { return true },
	}))

	// Routes
	setupRoutes(r)

	// Global preflight handler for any path
	r.OPTIONS("/*path", func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD")
		reqHeaders := c.GetHeader("Access-Control-Request-Headers")
		if reqHeaders == "" {
			reqHeaders = "Origin, Content-Type, Accept, Authorization, X-Requested-With, Range, Accept-Language, Accept-Encoding, Cache-Control, Pragma, If-Modified-Since"
		}
		c.Header("Access-Control-Allow-Headers", reqHeaders)
		c.Status(http.StatusNoContent)
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server starting on port %s", port)
	log.Printf("📁 Logos directory: ./logos")
	log.Printf("💾 Database: ./data/db.sqlite")

	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func setupRoutes(r *gin.Engine) {
	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Club routes (proxy to FAČR API)
	clubs := r.Group("/clubs")
	{
		clubs.GET("/search", searchClubs)
		clubs.GET("/search-with-logos", searchClubsWithLogos)
		clubs.GET("/:id", getClub)
	}

	// Logo routes
	logos := r.Group("/logos")
	{
		logos.GET("", listLogos)
		logos.GET("/:id", getLogo)
		logos.GET("/:id/json", getLogoWithMetadata)
		logos.POST("/:id", uploadLogo)
		logos.DELETE("/:id", deleteLogo)
	}
}

func initDB() (*sql.DB, error) {
	// Create data directory if it doesn't exist
	if err := os.MkdirAll("./data", 0755); err != nil {
		return nil, err
	}

	db, err := sql.Open("sqlite3", "./data/db.sqlite")
	if err != nil {
		return nil, err
	}

	// Create tables
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS logos (
			id TEXT PRIMARY KEY,
			club_name TEXT NOT NULL,
			club_city TEXT,
			club_type TEXT,
			club_website TEXT,
			has_svg INTEGER DEFAULT 0,
			has_png INTEGER DEFAULT 0,
			primary_format TEXT DEFAULT 'png',
			file_size_svg INTEGER,
			file_size_png INTEGER,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return nil, err
	}

	log.Println("✓ Database initialized")
	return db, nil
}
