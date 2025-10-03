package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

const FACR_API_BASE = "https://facr.tdvorak.dev"

type FACRClient struct {
	httpClient *http.Client
}

func NewFACRClient() *FACRClient {
	return &FACRClient{
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// Club represents a club from the FAČR API
type Club struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	City    string `json:"city,omitempty"`
	Type    string `json:"type,omitempty"`
	Website string `json:"website,omitempty"`
	LogoURL string `json:"logo_url,omitempty"`
}

// FACRSearchResponse represents the search response from FAČR API
type FACRSearchResponse struct {
	Query   string              `json:"query"`
	Count   int                 `json:"count"`
	Results []FACRSearchResult  `json:"results"`
}

// FACRSearchResult represents a single search result from FAČR API
type FACRSearchResult struct {
	Name      string `json:"name"`
	ClubID    string `json:"club_id"`
	ClubType  string `json:"club_type"`
	URL       string `json:"url"`
	LogoURL   string `json:"logo_url"`
	Category  string `json:"category"`
	Address   string `json:"address"`
}

// FACRClubResponse represents the club details response from FAČR API
type FACRClubResponse struct {
	Name            string `json:"name"`
	ClubID          string `json:"club_id"`
	ClubType        string `json:"club_type"`
	ClubInternalID  string `json:"club_internal_id"`
	URL             string `json:"url"`
	LogoURL         string `json:"logo_url"`
	Address         string `json:"address"`
	Category        string `json:"category"`
}

// SearchClubs searches for clubs by query
func (c *FACRClient) SearchClubs(query string) ([]Club, error) {
	url := fmt.Sprintf("%s/club/search?q=%s", FACR_API_BASE, query)

	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch from FAČR API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("FAČR API returned status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var searchResp FACRSearchResponse
	if err := json.Unmarshal(body, &searchResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	// Convert FACR results to our Club format
	clubs := make([]Club, 0, len(searchResp.Results))
	for _, result := range searchResp.Results {
		// Extract city from address if available
		city := extractCityFromAddress(result.Address)
		
		clubs = append(clubs, Club{
			ID:      result.ClubID,
			Name:    result.Name,
			City:    city,
			Type:    result.ClubType,
			Website: "", // Not provided in search results
			LogoURL: result.LogoURL,
		})
	}

	return clubs, nil
}

// extractCityFromAddress extracts city name from address string
// Address format: "Street, PostalCode City"
func extractCityFromAddress(address string) string {
	if address == "" {
		return ""
	}
	// Try to extract city after postal code (format: "Street, 12345 City")
	parts := strings.Split(address, ",")
	if len(parts) < 2 {
		return ""
	}
	// Get the part after comma and split by space
	lastPart := strings.TrimSpace(parts[len(parts)-1])
	words := strings.Fields(lastPart)
	if len(words) >= 2 {
		// Skip postal code (first word) and return the rest as city
		return strings.Join(words[1:], " ")
	}
	return ""
}

// GetClub gets a club by ID
func (c *FACRClient) GetClub(id string) (*Club, error) {
	// Try football first, then futsal
	url := fmt.Sprintf("%s/club/football/%s", FACR_API_BASE, id)

	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch from FAČR API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("FAČR API returned status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var clubResp FACRClubResponse
	if err := json.Unmarshal(body, &clubResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	// Extract city from address
	city := extractCityFromAddress(clubResp.Address)

	club := &Club{
		ID:      clubResp.ClubID,
		Name:    clubResp.Name,
		City:    city,
		Type:    clubResp.ClubType,
		Website: "", // Not provided in FACR API
		LogoURL: clubResp.LogoURL,
	}

	return club, nil
}
