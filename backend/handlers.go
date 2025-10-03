package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var facrClient = NewFACRClient()

// ==================== Club Handlers ====================

func searchClubs(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query parameter 'q' is required"})
		return
	}

	clubs, err := facrClient.SearchClubs(query)
	if err != nil {
		// Return demo data if FAČR API is unavailable
		c.JSON(http.StatusOK, getDemoClubs(query))
		return
	}

	c.JSON(http.StatusOK, clubs)
}

func getClub(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "club ID is required"})
		return
	}

	club, err := facrClient.GetClub(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "club not found"})
		return
	}

	c.JSON(http.StatusOK, club)
}

// Demo data fallback
func getDemoClubs(query string) []Club {
	demoClubs := []Club{
		{
			ID:      "11111111-2222-3333-4444-555555555555",
			Name:    "SK Slavia Praha",
			City:    "Praha",
			Type:    "football",
			Website: "https://www.slavia.cz",
		},
		{
			ID:      "22222222-3333-4444-5555-666666666666",
			Name:    "AC Sparta Praha",
			City:    "Praha",
			Type:    "football",
			Website: "https://www.sparta.cz",
		},
		{
			ID:      "33333333-4444-5555-6666-777777777777",
			Name:    "FC Viktoria Plzeň",
			City:    "Plzeň",
			Type:    "football",
			Website: "https://www.fcviktoria.cz",
		},
		{
			ID:      "44444444-5555-6666-7777-888888888888",
			Name:    "FC Baník Ostrava",
			City:    "Ostrava",
			Type:    "football",
			Website: "https://www.fcb.cz",
		},
		{
			ID:      "55555555-6666-7777-8888-999999999999",
			Name:    "SK Sigma Olomouc",
			City:    "Olomouc",
			Type:    "football",
			Website: "https://www.sigmafotbal.cz",
		},
		{
			ID:      "66666666-7777-8888-9999-aaaaaaaaaaaa",
			Name:    "FC Slovan Liberec",
			City:    "Liberec",
			Type:    "football",
			Website: "https://www.fcslovanliberec.cz",
		},
		{
			ID:      "77777777-8888-9999-aaaa-bbbbbbbbbbbb",
			Name:    "MFK Karviná",
			City:    "Karviná",
			Type:    "football",
			Website: "https://www.mfkkarvina.cz",
		},
		{
			ID:      "88888888-9999-aaaa-bbbb-cccccccccccc",
			Name:    "FC Fastav Zlín",
			City:    "Zlín",
			Type:    "football",
			Website: "https://www.fczlin.cz",
		},
		{
			ID:      "99999999-aaaa-bbbb-cccc-dddddddddddd",
			Name:    "FK Jablonec",
			City:    "Jablonec nad Nisou",
			Type:    "football",
			Website: "https://www.fkjablonec.cz",
		},
		{
			ID:      "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
			Name:    "SFC Opava",
			City:    "Opava",
			Type:    "football",
			Website: "https://www.sfcopava.cz",
		},
		{
			ID:      "bbbbbbbb-cccc-dddd-eeee-ffffffffffff",
			Name:    "FK Teplice",
			City:    "Teplice",
			Type:    "football",
			Website: "https://www.fkteplice.cz",
		},
		{
			ID:      "cccccccc-dddd-eeee-ffff-000000000000",
			Name:    "1. FK Příbram",
			City:    "Příbram",
			Type:    "football",
			Website: "https://www.1fkpribram.cz",
		},
		{
			ID:      "dddddddd-eeee-ffff-0000-111111111111",
			Name:    "SK Dynamo České Budějovice",
			City:    "České Budějovice",
			Type:    "football",
			Website: "https://www.dynamocb.cz",
		},
		{
			ID:      "eeeeeeee-ffff-0000-1111-222222222222",
			Name:    "FC Zbrojovka Brno",
			City:    "Brno",
			Type:    "football",
			Website: "https://www.fczbrno.cz",
		},
		{
			ID:      "ffffffff-0000-1111-2222-333333333333",
			Name:    "FC Vysočina Jihlava",
			City:    "Jihlava",
			Type:    "football",
			Website: "https://www.fcvysocina.cz",
		},
		{
			ID:      "00000000-1111-2222-3333-444444444444",
			Name:    "FK Mladá Boleslav",
			City:    "Mladá Boleslav",
			Type:    "football",
			Website: "https://www.fkmb.cz",
		},
		{
			ID:      "10101010-1111-2222-3333-444444444444",
			Name:    "SK Sigma Hranice",
			City:    "Hranice",
			Type:    "football",
			Website: "",
		},
		{
			ID:      "20202020-2222-3333-4444-555555555555",
			Name:    "SK Hranice",
			City:    "Hranice",
			Type:    "football",
			Website: "",
		},
		{
			ID:      "30303030-3333-4444-5555-666666666666",
			Name:    "TJ Krnov",
			City:    "Krnov",
			Type:    "football",
			Website: "",
		},
	}

	var results []Club
	lowerQuery := strings.ToLower(query)
	
	// Fuzzy matching: check contains in name, city, and partial matches
	for _, club := range demoClubs {
		lowerName := strings.ToLower(club.Name)
		lowerCity := strings.ToLower(club.City)
		
		// Exact contains match in name or city
		if strings.Contains(lowerName, lowerQuery) || strings.Contains(lowerCity, lowerQuery) {
			results = append(results, club)
			continue
		}
		
		// Fuzzy match: check if query matches start of any word in name
		words := strings.Fields(lowerName)
		for _, word := range words {
			if strings.HasPrefix(word, lowerQuery) {
				results = append(results, club)
				break
			}
		}
	}

	return results
}

// ==================== Logo Handlers ====================

type LogoMetadata struct {
	ID           string    `json:"id"`
	ClubName     string    `json:"club_name"`
	ClubCity     string    `json:"club_city,omitempty"`
	ClubType     string    `json:"club_type,omitempty"`
	ClubWebsite  string    `json:"club_website,omitempty"`
	HasSVG       bool      `json:"has_svg"`
	HasPNG       bool      `json:"has_png"`
	PrimaryFormat string   `json:"primary_format"`
	LogoURL      string    `json:"logo_url"`
	LogoURLSVG   string    `json:"logo_url_svg,omitempty"`
	LogoURLPNG   string    `json:"logo_url_png,omitempty"`
	FileSizeSVG  int64     `json:"file_size_svg,omitempty"`
	FileSizePNG  int64     `json:"file_size_png,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// getLogo returns the logo file (PNG preferred, SVG fallback)
func getLogo(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "logo ID is required"})
		return
	}

	// Validate UUID format
	if _, err := uuid.Parse(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID format"})
		return
	}

	// Check format preference from query
	format := c.Query("format") // can be "svg" or "png"

	var logoPath string
	var contentType string
	var found bool

	// Try PNG first (primary format)
	if format == "" || format == "png" {
		pngPath := filepath.Join("./logos/png", id+".png")
		if _, err := os.Stat(pngPath); err == nil {
			logoPath = pngPath
			contentType = "image/png"
			found = true
		}
	}

	// Try SVG if PNG not found or explicitly requested
	if !found && (format == "" || format == "svg") {
		svgPath := filepath.Join("./logos/svg", id+".svg")
		if _, err := os.Stat(svgPath); err == nil {
			logoPath = svgPath
			contentType = "image/svg+xml"
			found = true
		}
	}

	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "logo not found"})
		return
	}

	c.Header("Content-Type", contentType)
	c.Header("Cache-Control", "public, max-age=31536000")
	c.File(logoPath)
}

func getLogoWithMetadata(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "logo ID is required"})
		return
	}

	// Validate UUID format
	if _, err := uuid.Parse(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID format"})
		return
	}

	// Get metadata from database
	var metadata LogoMetadata
	var hasSVG, hasPNG int
	err := db.QueryRow(`
		SELECT id, club_name, club_city, club_type, club_website,
		       has_svg, has_png, primary_format,
		       file_size_svg, file_size_png,
		       created_at, updated_at
		FROM logos WHERE id = ?
	`, id).Scan(
		&metadata.ID,
		&metadata.ClubName,
		&metadata.ClubCity,
		&metadata.ClubType,
		&metadata.ClubWebsite,
		&hasSVG,
		&hasPNG,
		&metadata.PrimaryFormat,
		&metadata.FileSizeSVG,
		&metadata.FileSizePNG,
		&metadata.CreatedAt,
		&metadata.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "logo not found"})
		return
	}

	if err != nil {
		log.Printf("Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	metadata.HasSVG = hasSVG == 1
	metadata.HasPNG = hasPNG == 1

	// Construct logo URLs
	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	baseURL := fmt.Sprintf("%s://%s", scheme, c.Request.Host)
	
	// Primary URL (PNG preferred)
	if metadata.HasPNG {
		metadata.LogoURL = fmt.Sprintf("%s/logos/%s?format=png", baseURL, id)
	} else if metadata.HasSVG {
		metadata.LogoURL = fmt.Sprintf("%s/logos/%s?format=svg", baseURL, id)
	}

	// Format-specific URLs
	if metadata.HasSVG {
		metadata.LogoURLSVG = fmt.Sprintf("%s/logos/%s?format=svg", baseURL, id)
	}
	if metadata.HasPNG {
		metadata.LogoURLPNG = fmt.Sprintf("%s/logos/%s?format=png", baseURL, id)
	}

	c.JSON(http.StatusOK, metadata)
}

// List all logos
func listLogos(c *gin.Context) {
	rows, err := db.Query(`
		SELECT id, club_name, club_city, club_type, club_website,
		       has_svg, has_png, primary_format,
		       created_at, updated_at
		FROM logos
		ORDER BY club_name
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	defer rows.Close()

	var logos []LogoMetadata
	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	baseURL := fmt.Sprintf("%s://%s", scheme, c.Request.Host)

	for rows.Next() {
		var logo LogoMetadata
		var hasSVG, hasPNG int
		
		err := rows.Scan(
			&logo.ID,
			&logo.ClubName,
			&logo.ClubCity,
			&logo.ClubType,
			&logo.ClubWebsite,
			&hasSVG,
			&hasPNG,
			&logo.PrimaryFormat,
			&logo.CreatedAt,
			&logo.UpdatedAt,
		)
		if err != nil {
			continue
		}

		logo.HasSVG = hasSVG == 1
		logo.HasPNG = hasPNG == 1

		if logo.HasPNG {
			logo.LogoURL = fmt.Sprintf("%s/logos/%s?format=png", baseURL, logo.ID)
		} else if logo.HasSVG {
			logo.LogoURL = fmt.Sprintf("%s/logos/%s?format=svg", baseURL, logo.ID)
		}

		logos = append(logos, logo)
	}

	c.JSON(http.StatusOK, logos)
}

func uploadLogo(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "logo ID is required"})
		return
	}

	// Validate UUID format
	if _, err := uuid.Parse(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID format"})
		return
	}

	// Read metadata from form
	clubName := c.PostForm("club_name")
	clubCity := c.PostForm("club_city")
	clubType := c.PostForm("club_type")
	clubWebsite := c.PostForm("club_website")

	// Derive metadata if missing
	if clubName == "" {
		if club, err := facrClient.GetClub(id); err == nil && club != nil {
			if club.Name != "" {
				clubName = club.Name
			}
			if clubType == "" && club.Type != "" {
				clubType = club.Type
			}
			if clubCity == "" && club.City != "" {
				clubCity = club.City
			}
			if clubWebsite == "" && club.Website != "" {
				clubWebsite = club.Website
			}
		}
		if clubName == "" {
			clubName = "Club " + id
		}
	}

	// Get uploaded file
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no file provided"})
		return
	}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".svg" && ext != ".png" && ext != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "only .svg, .png and .pdf files are allowed"})
		return
	}

	// Determine storage paths
	var svgPath, pngPath string
	var hasSVG, hasPNG int
	var sizeSVG, sizePNG int64

	if ext == ".svg" || ext == ".pdf" {
		pngPath = filepath.Join("./logos/png", id+".png")
		
		if ext == ".svg" {
			svgPath = filepath.Join("./logos/svg", id+".svg")
			
			// Save SVG
			if err := c.SaveUploadedFile(file, svgPath); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save SVG file"})
				return
			}
			
			// Get SVG file size
			if stat, err := os.Stat(svgPath); err == nil {
				sizeSVG = stat.Size()
			}
			hasSVG = 1

			// Convert SVG to PNG
			log.Printf("Converting SVG to PNG for club: %s", clubName)
			if err := ConvertSVGToPNG(svgPath, pngPath, 512); err != nil {
				log.Printf("Warning: Failed to convert SVG to PNG: %v", err)
				// Don't fail the upload, just log the warning
			} else {
				// Optimize PNG
				if err := OptimizePNG(pngPath); err != nil {
					log.Printf("Warning: Failed to optimize PNG: %v", err)
				}
				// Get PNG file size
				if stat, err := os.Stat(pngPath); err == nil {
					sizePNG = stat.Size()
					hasPNG = 1
				}
			}
		} else {
			// PDF file - convert directly to PNG
			pdfTempPath := filepath.Join("./logos/temp", id+".pdf")
			os.MkdirAll("./logos/temp", 0755)
			
			if err := c.SaveUploadedFile(file, pdfTempPath); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save PDF file"})
				return
			}
			
			log.Printf("Converting PDF to PNG for club: %s", clubName)
			if err := ConvertPDFToPNG(pdfTempPath, pngPath, 512); err != nil {
				log.Printf("Error: Failed to convert PDF to PNG: %v", err)
				os.Remove(pdfTempPath)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to convert PDF to PNG"})
				return
			}
			
			// Clean up temp PDF
			os.Remove(pdfTempPath)
			
			// Optimize PNG
			if err := OptimizePNG(pngPath); err != nil {
				log.Printf("Warning: Failed to optimize PNG: %v", err)
			}
			
			// Get PNG file size
			if stat, err := os.Stat(pngPath); err == nil {
				sizePNG = stat.Size()
				hasPNG = 1
			}
		}

	} else {
		// PNG upload
		pngPath = filepath.Join("./logos/png", id+".png")
		
		if err := c.SaveUploadedFile(file, pngPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save PNG file"})
			return
		}
		
		// Optimize PNG
		if err := OptimizePNG(pngPath); err != nil {
			log.Printf("Warning: Failed to optimize PNG: %v", err)
		}
		
		// Get PNG file size
		if stat, err := os.Stat(pngPath); err == nil {
			sizePNG = stat.Size()
		}
		hasPNG = 1
	}

	// Save metadata to database
	_, err = db.Exec(`
		INSERT OR REPLACE INTO logos (
			id, club_name, club_city, club_type, club_website,
			has_svg, has_png, primary_format,
			file_size_svg, file_size_png, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, 'png', ?, ?, CURRENT_TIMESTAMP)
	`, id, clubName, clubCity, clubType, clubWebsite, hasSVG, hasPNG, sizeSVG, sizePNG)

	if err != nil {
		log.Printf("Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save metadata"})
		return
	}

	response := gin.H{
		"success":    true,
		"id":         id,
		"club_name":  clubName,
		"has_svg":    hasSVG == 1,
		"has_png":    hasPNG == 1,
		"size_svg":   sizeSVG,
		"size_png":   sizePNG,
		"message":    "logo uploaded successfully",
	}

	c.JSON(http.StatusOK, response)
}
