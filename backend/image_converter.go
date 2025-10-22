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

	"github.com/srwiley/oksvg"
	"github.com/srwiley/rasterx"
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

	// Try pure-Go conversion
	if err := convertWithGoRenderer(svgPath, pngPath, width); err == nil {
		return nil
	}

	return fmt.Errorf("no SVG converter available (install ImageMagick or Inkscape, or ensure Go renderer deps)")
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

func convertWithGoRenderer(svgPath, pngPath string, width int) error {
	f, err := os.Open(svgPath)
	if err != nil {
		return fmt.Errorf("open svg: %w", err)
	}
	defer f.Close()

	icon, err := oksvg.ReadIconStream(f)
	if err != nil {
		return fmt.Errorf("parse svg: %w", err)
	}

	vb := icon.ViewBox
	targetW := width
	if targetW <= 0 {
		targetW = int(vb.W)
		if targetW <= 0 {
			targetW = 512
		}
	}
	var targetH int
	if vb.W != 0 {
		targetH = int(float64(targetW) * (vb.H / vb.W))
	} else {
		targetH = targetW
	}
	if targetH <= 0 {
		targetH = targetW
	}

	icon.SetTarget(0, 0, float64(targetW), float64(targetH))

	rgba := image.NewRGBA(image.Rect(0, 0, targetW, targetH))
	scanner := rasterx.NewScannerGV(targetW, targetH, rgba, rgba.Bounds())
	raster := rasterx.NewDasher(targetW, targetH, scanner)
	icon.Draw(raster, 1.0)

	out, err := os.Create(pngPath)
	if err != nil {
		return fmt.Errorf("create png: %w", err)
	}
	defer out.Close()

	if err := png.Encode(out, rgba); err != nil {
		os.Remove(pngPath)
		return fmt.Errorf("encode png: %w", err)
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
