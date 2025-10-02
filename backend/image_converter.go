package main

import (
	"bytes"
	"fmt"
	"image"
	"image/png"
	"io"
	"os"
	"os/exec"
	"path/filepath"
)

// ConvertSVGToPNG converts an SVG file to PNG format
// Uses ImageMagick/Inkscape if available, otherwise returns error
func ConvertSVGToPNG(svgPath, pngPath string, width int) error {
	// Try using ImageMagick convert command
	if err := convertWithImageMagick(svgPath, pngPath, width); err == nil {
		return nil
	}

	// Try using Inkscape
	if err := convertWithInkscape(svgPath, pngPath, width); err == nil {
		return nil
	}

	// If no converter available, copy SVG as fallback and log warning
	return fmt.Errorf("no SVG converter available (install ImageMagick or Inkscape)")
}

// ConvertPDFToPNG converts a PDF file to PNG format
// Uses ImageMagick/Ghostscript if available, otherwise returns error
func ConvertPDFToPNG(pdfPath, pngPath string, width int) error {
	// Try using ImageMagick convert command (requires Ghostscript)
	cmd := exec.Command("convert",
		"-background", "none",
		"-density", "300",
		"-resize", fmt.Sprintf("%dx%d", width, width),
		fmt.Sprintf("%s[0]", pdfPath), // Only first page
		pngPath,
	)
	
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("PDF conversion failed (install ImageMagick and Ghostscript): %v - %s", err, stderr.String())
	}
	
	return nil
}

func convertWithImageMagick(svgPath, pngPath string, width int) error {
	cmd := exec.Command("convert",
		"-background", "none",
		"-density", "300",
		"-resize", fmt.Sprintf("%dx%d", width, width),
		svgPath,
		pngPath,
	)
	
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("imagemagick conversion failed: %v - %s", err, stderr.String())
	}
	
	return nil
}

func convertWithInkscape(svgPath, pngPath string, width int) error {
	cmd := exec.Command("inkscape",
		"--export-type=png",
		fmt.Sprintf("--export-filename=%s", pngPath),
		fmt.Sprintf("--export-width=%d", width),
		svgPath,
	)
	
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("inkscape conversion failed: %v - %s", err, stderr.String())
	}
	
	return nil
}

// OptimizePNG optimizes a PNG file (basic implementation)
func OptimizePNG(pngPath string) error {
	// Open the file
	file, err := os.Open(pngPath)
	if err != nil {
		return err
	}
	defer file.Close()

	// Decode the image
	img, _, err := image.Decode(file)
	if err != nil {
		return err
	}

	// Create temp file
	tempPath := pngPath + ".tmp"
	tempFile, err := os.Create(tempPath)
	if err != nil {
		return err
	}
	defer tempFile.Close()

	// Encode with compression
	encoder := png.Encoder{
		CompressionLevel: png.BestCompression,
	}
	
	if err := encoder.Encode(tempFile, img); err != nil {
		os.Remove(tempPath)
		return err
	}

	// Replace original with optimized
	if err := os.Rename(tempPath, pngPath); err != nil {
		os.Remove(tempPath)
		return err
	}

	return nil
}

// IsSVGFile checks if the file is an SVG by reading its content
func IsSVGFile(file io.Reader) (bool, error) {
	buf := make([]byte, 512)
	n, err := file.Read(buf)
	if err != nil && err != io.EOF {
		return false, err
	}

	content := string(buf[:n])
	return bytes.Contains([]byte(content), []byte("<svg")) ||
		bytes.Contains([]byte(content), []byte("<?xml")), nil
}

// ValidateImageFile validates that a file is a valid SVG or PNG
func ValidateImageFile(filePath string) (string, error) {
	ext := filepath.Ext(filePath)
	
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	if ext == ".svg" {
		isSVG, err := IsSVGFile(file)
		if err != nil {
			return "", err
		}
		if !isSVG {
			return "", fmt.Errorf("file is not a valid SVG")
		}
		return "svg", nil
	}

	if ext == ".png" {
		_, err := png.Decode(file)
		if err != nil {
			return "", fmt.Errorf("file is not a valid PNG: %v", err)
		}
		return "png", nil
	}

	return "", fmt.Errorf("unsupported file format: %s", ext)
}
