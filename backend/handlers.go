package main

import (
	"bytes"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	neturl "net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"unicode"

	"github.com/PuerkitoBio/goquery"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/text/unicode/norm"
)

// ==================== Club Handlers ====================

func searchClubs(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	if q == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query parameter 'q' is required"})
		return
	}

	clubs, err := scrapeFotbalSearch(q)
	if err != nil || len(clubs) == 0 {
		nq := removeDiacritics(strings.ToLower(q))
		if nq != strings.ToLower(q) {
			if c2, err2 := scrapeFotbalSearch(nq); err2 == nil && len(c2) > 0 {
				c.JSON(http.StatusOK, c2)
				return
			}
		}
		c.JSON(http.StatusOK, getDemoClubs(q))
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

	club, err := fetchClubByID(id)
	if err != nil || club == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "club not found"})
		return
	}

	c.JSON(http.StatusOK, club)
}

type ClubSearchWithLogoResult struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	LogoURL      string `json:"logo_url,omitempty"`
	HasLocalLogo bool   `json:"has_local_logo"`
}

func searchClubsWithLogos(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	if q == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query parameter 'q' is required"})
		return
	}

	sport := strings.ToLower(strings.TrimSpace(c.DefaultQuery("sport", c.DefaultQuery("type", ""))))

	base := "SELECT id, club_name, has_svg, has_png FROM logos"
	where := ""
	args := []interface{}{}
	if q != "" {
		normQ := normalizeClubSearchQuery(q)
		likeRaw := "%" + strings.ToLower(q) + "%"
		if normQ != "" && normQ != q {
			likeNorm := "%" + strings.ToLower(normQ) + "%"
			where = " WHERE ((LOWER(club_name) LIKE ? OR LOWER(club_name) LIKE ?) OR id LIKE ?)"
			args = append(args, likeRaw, likeNorm, "%"+q+"%")
		} else {
			where = " WHERE (LOWER(club_name) LIKE ? OR id LIKE ?)"
			args = append(args, likeRaw, "%"+q+"%")
		}
	}
	if sport != "" && sport != "all" {
		if where == "" {
			where = " WHERE "
		} else {
			where += " AND "
		}
		where += "LOWER(club_type) = ?"
		args = append(args, sport)
	}

	query := base + where + " ORDER BY club_name"
	rows, err := db.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	defer rows.Close()

	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	baseURL := fmt.Sprintf("%s://%s", scheme, c.Request.Host)

	results := []ClubSearchWithLogoResult{}
	for rows.Next() {
		var id, name string
		var hasSVG, hasPNG int
		if err := rows.Scan(&id, &name, &hasSVG, &hasPNG); err != nil {
			continue
		}
		logoURL := ""
		if hasPNG == 1 {
			logoURL = fmt.Sprintf("%s/logos/%s?format=png", baseURL, id)
		} else if hasSVG == 1 {
			logoURL = fmt.Sprintf("%s/logos/%s?format=svg", baseURL, id)
		}
		res := ClubSearchWithLogoResult{
			ID:           id,
			Name:         name,
			LogoURL:      logoURL,
			HasLocalLogo: hasSVG == 1 || hasPNG == 1,
		}
		results = append(results, res)
	}

	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	c.JSON(http.StatusOK, results)
}

func scrapeFotbalSearch(q string) ([]Club, error) {
	vals := neturl.Values{}
	vals.Set("q", q)
	searchURL := "https://www.fotbal.cz/club/hledej?" + vals.Encode()
	req, _ := http.NewRequest("GET", searchURL, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8")
	req.Header.Set("Accept-Language", "cs-CZ,cs;q=0.9,en;q=0.8")
	client := &http.Client{Timeout: 12 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		vals2 := neturl.Values{}
		vals2.Set("q", "\""+q+"\"")
		searchURL = "https://www.fotbal.cz/club/hledej?" + vals2.Encode()
		req2, _ := http.NewRequest("GET", searchURL, nil)
		req2.Header = req.Header.Clone()
		resp2, err2 := client.Do(req2)
		if err2 != nil {
			return nil, err2
		}
		defer resp2.Body.Close()
		if resp2.StatusCode != http.StatusOK {
			return []Club{}, nil
		}
		resp = resp2
	}
	buf := new(bytes.Buffer)
	_, _ = buf.ReadFrom(resp.Body)
	doc, err := goquery.NewDocumentFromReader(bytes.NewReader(buf.Bytes()))
	if err != nil {
		return nil, err
	}
	clubs := []Club{}
	doc.Find("li.ListItemSplit").Each(func(_ int, li *goquery.Selection) {
		a := li.Find("a.Link--inverted").First()
		href := strings.TrimSpace(a.AttrOr("href", ""))
		if href == "" {
			return
		}
		name := strings.TrimSpace(a.Find("span.H7").First().Text())
		if name == "" {
			name = strings.TrimSpace(a.Text())
		}
		logoURL := strings.TrimSpace(a.Find("img").First().AttrOr("src", ""))
		address := strings.TrimSpace(li.Find(".ClubAddress p").First().Text())
		clubType := "football"
		if strings.Contains(strings.ToLower(href), "/futsal/") {
			clubType = "futsal"
		}
		parts := strings.Split(strings.TrimRight(href, "/"), "/")
		clubID := ""
		if len(parts) > 0 {
			clubID = parts[len(parts)-1]
		}
		if !strings.HasPrefix(href, "http://") && !strings.HasPrefix(href, "https://") {
			href = "https://www.fotbal.cz" + href
		}
		city := extractCityFromAddress(address)
		clubs = append(clubs, Club{ID: clubID, Name: name, City: city, Type: clubType, Website: href, LogoURL: logoURL})
	})
	return clubs, nil
}

func fetchClubByID(id string) (*Club, error) {
	tryFetch := func(base string, typ string) (*Club, error) {
		url := fmt.Sprintf("%s/%s", base, id)
		req, _ := http.NewRequest("GET", url, nil)
		req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36")
		req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
		req.Header.Set("Accept-Language", "cs-CZ,cs;q=0.9,en;q=0.8")
		client := &http.Client{Timeout: 12 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("status %d", resp.StatusCode)
		}
		doc, err := goquery.NewDocumentFromReader(resp.Body)
		if err != nil {
			return nil, err
		}
		name := strings.TrimSpace(doc.Find("h1.H4 span").First().Text())
		address := strings.TrimSpace(doc.Find(".ClubAddress p").First().Text())
		city := extractCityFromAddress(address)
		logo := fmt.Sprintf("https://is1.fotbal.cz/media/kluby/%s/%s_crop.jpg", id, id)
		return &Club{ID: id, Name: name, City: city, Type: typ, Website: "", LogoURL: logo}, nil
	}
	if club, err := tryFetch("https://www.fotbal.cz/souteze/club/club", "football"); err == nil && club != nil && club.Name != "" {
		return club, nil
	}
	if club, err := tryFetch("https://www.fotbal.cz/futsal/club/club", "futsal"); err == nil && club != nil && club.Name != "" {
		return club, nil
	}
	return nil, fmt.Errorf("not found")
}

func removeDiacritics(s string) string {
	d := norm.NFD.String(s)
	b := make([]rune, 0, len(d))
	for _, r := range d {
		if unicode.Is(unicode.Mn, r) {
			continue
		}
		b = append(b, r)
	}
	return string(b)
}

func normalizeClubSearchQuery(q string) string {
	s := strings.TrimSpace(q)
	if s == "" {
		return ""
	}

	lower := strings.ToLower(s)
	parts := strings.Fields(lower)
	if len(parts) == 0 {
		return ""
	}

	switch parts[0] {
	case "fk":
		parts[0] = "fotbalový klub"
	case "tj":
		parts[0] = "tělovýchovná jednota"
	case "sk":
		parts[0] = "sportovní klub"
	}

	return strings.Join(parts, " ")
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
	ID            string    `json:"id"`
	ClubName      string    `json:"club_name"`
	ClubCity      string    `json:"club_city,omitempty"`
	ClubType      string    `json:"club_type,omitempty"`
	ClubWebsite   string    `json:"club_website,omitempty"`
	HasSVG        bool      `json:"has_svg"`
	HasPNG        bool      `json:"has_png"`
	PrimaryFormat string    `json:"primary_format"`
	LogoURL       string    `json:"logo_url"`
	LogoURLSVG    string    `json:"logo_url_svg,omitempty"`
	LogoURLPNG    string    `json:"logo_url_png,omitempty"`
	FileSizeSVG   int64     `json:"file_size_svg,omitempty"`
	FileSizePNG   int64     `json:"file_size_png,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
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

	// Set CORS headers explicitly for file serving
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Methods", "GET, OPTIONS")
	c.Header("Access-Control-Allow-Headers", "*")
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
	q := strings.TrimSpace(c.Query("q"))
	sport := strings.ToLower(strings.TrimSpace(c.DefaultQuery("sport", c.DefaultQuery("type", ""))))
	sortParam := c.DefaultQuery("sort", "name")
	limitStr := c.Query("limit")
	pageStr := c.Query("page")

	base := "SELECT id, club_name, club_city, club_type, club_website, has_svg, has_png, primary_format, created_at, updated_at FROM logos"
	where := ""
	args := []interface{}{}
	if q != "" {
		where = " WHERE LOWER(club_name) LIKE ? OR LOWER(club_city) LIKE ? OR id LIKE ?"
		like := "%" + strings.ToLower(q) + "%"
		args = append(args, like, like, "%"+q+"%")
	}
	if sport != "" && sport != "all" {
		if where == "" {
			where = " WHERE LOWER(club_type) = ?"
		} else {
			where += " AND LOWER(club_type) = ?"
		}
		args = append(args, sport)
	}
	order := " ORDER BY club_name"
	if sortParam == "recent" {
		order = " ORDER BY datetime(updated_at) DESC, datetime(created_at) DESC"
	}
	limitClause := ""
	if limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
			limitClause = " LIMIT ?"
			args = append(args, limit)
			if pageStr != "" {
				if page, err := strconv.Atoi(pageStr); err == nil {
					if page < 1 {
						page = 1
					}
					offset := (page - 1) * limit
					limitClause += " OFFSET ?"
					args = append(args, offset)
				}
			}
		}
	}

	query := base + where + order + limitClause
	rows, err := db.Query(query, args...)
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
		if err := rows.Scan(
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
		); err != nil {
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

	if q != "" && len(logos) == 0 {
		limitClause2 := ""
		args2 := []interface{}{}
		if limitStr != "" {
			if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
				limitClause2 = " LIMIT ?"
				args2 = append(args2, limit)
				if pageStr != "" {
					if page, err := strconv.Atoi(pageStr); err == nil {
						if page < 1 {
							page = 1
						}
						offset := (page - 1) * limit
						limitClause2 += " OFFSET ?"
						args2 = append(args2, offset)
					}
				}
			}
		}
		q2 := base + order + limitClause2
		rows2, err2 := db.Query(q2, args2...)
		if err2 == nil {
			defer rows2.Close()
			normQ := removeDiacritics(strings.ToLower(q))
			tmp := []LogoMetadata{}
			for rows2.Next() {
				var logo LogoMetadata
				var hasSVG2, hasPNG2 int
				if err := rows2.Scan(
					&logo.ID,
					&logo.ClubName,
					&logo.ClubCity,
					&logo.ClubType,
					&logo.ClubWebsite,
					&hasSVG2,
					&hasPNG2,
					&logo.PrimaryFormat,
					&logo.CreatedAt,
					&logo.UpdatedAt,
				); err != nil {
					continue
				}
				logo.HasSVG = hasSVG2 == 1
				logo.HasPNG = hasPNG2 == 1
				if logo.HasPNG {
					logo.LogoURL = fmt.Sprintf("%s/logos/%s?format=png", baseURL, logo.ID)
				} else if logo.HasSVG {
					logo.LogoURL = fmt.Sprintf("%s/logos/%s?format=svg", baseURL, logo.ID)
				}
				nameN := removeDiacritics(strings.ToLower(logo.ClubName))
				cityN := removeDiacritics(strings.ToLower(logo.ClubCity))
				if strings.Contains(nameN, normQ) || strings.Contains(cityN, normQ) || strings.Contains(strings.ToLower(logo.ID), strings.ToLower(q)) {
					tmp = append(tmp, logo)
				}
			}
			logos = tmp
		}
	}

	c.JSON(http.StatusOK, logos)
}

func deleteLogo(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "logo ID is required"})
		return
	}
	if _, err := uuid.Parse(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID format"})
		return
	}

	_, err := db.Exec("DELETE FROM logos WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	pngPath := filepath.Join("./logos/png", id+".png")
	svgPath := filepath.Join("./logos/svg", id+".svg")
	os.Remove(pngPath)
	os.Remove(svgPath)

	c.JSON(http.StatusOK, gin.H{"success": true, "id": id})
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

	if clubName == "" {
		if club, err := fetchClubByID(id); err == nil && club != nil {
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
		"success":   true,
		"id":        id,
		"club_name": clubName,
		"has_svg":   hasSVG == 1,
		"has_png":   hasPNG == 1,
		"size_svg":  sizeSVG,
		"size_png":  sizePNG,
		"message":   "logo uploaded successfully",
	}

	c.JSON(http.StatusOK, response)
}
