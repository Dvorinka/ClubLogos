import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { optimize as optimizeSvg } from 'svgo';
import sharp from 'sharp';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const CONFIG = {
  // File size reporting thresholds (in KB)
  sizeThresholds: {
    small: 10,
    medium: 100,
    large: 500,
  },
  // Compression settings
  compression: {
    png: {
      quality: 80, // 1-100
      effort: 6,   // 1-9 (higher is slower but better compression)
    },
    jpg: {
      quality: 80, // 1-100
      mozjpeg: true,
    },
    pdf: {
      quality: 'printer', // 'screen', 'ebook', 'printer', 'prepress', or 'default'
    },
  },
  // Directories to scan (relative to project root)
  scanDirs: [
    'backend/logos',
    'data/logos',
    'frontend/dist',
  ],
  // File extensions to process
  fileExtensions: ['svg', 'png', 'jpg', 'jpeg', 'pdf'],
};

// Statistics
const stats = {
  totalFiles: 0,
  processedFiles: 0,
  skippedFiles: 0,
  totalSaved: 0,
  byType: {},
};

/**
 * Format file size in human-readable format
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file size in bytes
 */
async function getFileSize(filePath) {
  const stats = await fs.stat(filePath);
  return stats.size;
}

/**
 * Optimize SVG file
 */
async function optimizeSvgFile(filePath) {
  const svg = await fs.readFile(filePath, 'utf8');
  const result = optimizeSvg(svg, {
    path: filePath,
    multipass: true,
    plugins: [
      'preset-default',
      {
        name: 'removeViewBox',
        active: false,
      },
      {
        name: 'addAttributesToSVGElement',
        params: {
          attributes: [{ 'data-optimized': 'true' }],
        },
      },
    ],
  });
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  await fs.writeFile(filePath, result.data);
  return true;
}

async function convertSvgToPng(svgPath) {
  try {
    const normalized = path.normalize(svgPath);
    let pngPath = normalized.replace(/\.svg$/i, '.png');

    const mappings = [
      {
        from: path.join(path.sep, 'data', 'logos', 'svg') + path.sep,
        to:   path.join(path.sep, 'data', 'logos', 'png') + path.sep,
      },
      {
        from: path.join(path.sep, 'backend', 'logos', 'svg') + path.sep,
        to:   path.join(path.sep, 'backend', 'logos', 'png') + path.sep,
      },
    ];

    for (const { from, to } of mappings) {
      if (normalized.includes(from)) {
        pngPath = normalized.replace(from, to).replace(/\.svg$/i, '.png');
        break;
      }
    }

    await fs.mkdir(path.dirname(pngPath), { recursive: true });

    const image = sharp(svgPath, { density: 300 });
    await image
      .resize({ width: 512, fit: 'inside', withoutEnlargement: true })
      .png({ quality: CONFIG.compression.png.quality, effort: CONFIG.compression.png.effort })
      .toFile(pngPath);

    console.log(chalk.green(`  ✓ Converted to PNG: ${pngPath}`));
    return true;
  } catch (error) {
    console.warn(chalk.yellow(`  ⚠️  SVG to PNG conversion skipped: ${error.message}`));
    return false;
  }
}

/**
 * Optimize PNG/JPG file
 */
async function optimizeImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const isJpeg = ['.jpg', '.jpeg'].includes(ext);
  
  const pipeline = sharp(filePath);
  
  // Get image metadata
  const metadata = await pipeline.metadata();
  
  // Skip if already optimized
  if (metadata.optimizationLevel) {
    return false;
  }
  
  // Optimize based on file type
  if (isJpeg) {
    await pipeline.jpeg({
      quality: CONFIG.compression.jpg.quality,
      mozjpeg: CONFIG.compression.jpg.mozjpeg,
    });
  } else {
    await pipeline.png({
      quality: CONFIG.compression.png.quality,
      effort: CONFIG.compression.png.effort,
    });
  }
  
  // Write optimized file
  await pipeline.toFile(filePath);
  return true;
}

/**
 * Optimize PDF file using Ghostscript
 */
async function optimizePdfFile(filePath) {
  try {
    // Create a temporary file
    const tempPath = `${filePath}.optimized`;
    
    // Use Ghostscript to optimize the PDF
    const { stderr } = await execPromise(
      `gswin64c -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 ` +
      `-dPDFSETTINGS=/${CONFIG.compression.pdf.quality} ` +
      `-dNOPAUSE -dQUIET -dBATCH ` +
      `-sOutputFile="${tempPath}" "${filePath}"`
    );
    
    if (stderr && !stderr.includes('Error')) {
      // Replace original with optimized version
      await fs.rename(tempPath, filePath);
      return true;
    } else {
      // Clean up temp file if there was an error
      await fs.unlink(tempPath).catch(() => {});
      throw new Error(stderr || 'Unknown error optimizing PDF');
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(chalk.yellow('  ⚠️  Ghostscript not found. Install it from https://ghostscript.com/ for PDF optimization.'));
    }
    return false;
  }
}

/**
 * Process a single file
 */
async function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase().slice(1);
  const fileName = path.basename(filePath);
  
  // Skip unsupported file types
  if (!CONFIG.fileExtensions.includes(ext)) {
    return { status: 'skipped', message: 'Unsupported file type' };
  }
  
  // Get original size
  const originalSize = await getFileSize(filePath);
  const originalSizeFormatted = formatSize(originalSize);
  
  // Skip empty files
  if (originalSize === 0) {
    return { status: 'skipped', message: 'Empty file' };
  }
  
  try {
    let optimized = false;
    
    // Optimize based on file type
    switch (ext) {
      case 'svg':
        {
          const didOptimize = await optimizeSvgFile(filePath);
          const didConvert = await convertSvgToPng(filePath);
          optimized = didOptimize || didConvert;
        }
        break;
      case 'png':
      case 'jpg':
      case 'jpeg':
        optimized = await optimizeImageFile(filePath);
        break;
      case 'pdf':
        optimized = await optimizePdfFile(filePath);
        break;
    }
    
    // Get new size
    const newSize = await getFileSize(filePath);
    const newSizeFormatted = formatSize(newSize);
    const saved = originalSize - newSize;
    const savedPercent = ((saved / originalSize) * 100).toFixed(2);
    
    // Update statistics
    stats.processedFiles++;
    stats.totalSaved += saved;
    
    if (!stats.byType[ext]) {
      stats.byType[ext] = { count: 0, saved: 0 };
    }
    stats.byType[ext].count++;
    stats.byType[ext].saved += saved;
    
    return {
      status: 'optimized',
      originalSize,
      newSize,
      saved,
      savedPercent,
      message: `${originalSizeFormatted} → ${newSizeFormatted} (saved ${savedPercent}%)`,
    };
    
  } catch (error) {
    console.error(chalk.red(`  ✗ Error optimizing ${fileName}: ${error.message}`));
    stats.skippedFiles++;
    return { status: 'error', message: error.message };
  }
}

/**
 * Process a directory recursively
 */
async function processDirectory(directory) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase().slice(1);
        
        if (CONFIG.fileExtensions.includes(ext)) {
          stats.totalFiles++;
          
          console.log(chalk.blue(`\n🔍 Processing: ${fullPath}`));
          
          const result = await processFile(fullPath);
          
          switch (result.status) {
            case 'optimized':
              console.log(chalk.green(`  ✓ Optimized: ${result.message}`));
              break;
            case 'skipped':
              console.log(chalk.yellow(`  ⏭️  Skipped: ${result.message}`));
              break;
            case 'error':
              console.error(chalk.red(`  ✗ Error: ${result.message}`));
              break;
          }
        }
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error reading directory ${directory}: ${error.message}`));
  }
}

/**
 * Main function
 */
async function main() {
  console.log(chalk.cyan('🚀 Starting asset optimization...\n'));
  
  const startTime = Date.now();
  
  // Process each directory
  for (const dir of CONFIG.scanDirs) {
    const fullPath = path.resolve(__dirname, '..', dir);
    console.log(chalk.cyan(`📂 Processing directory: ${fullPath}`));
    await processDirectory(fullPath);
  }
  
  // Calculate total time
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Print summary
  console.log('\n' + chalk.cyan('📊 Optimization Summary:'));
  console.log(chalk.cyan('='.repeat(50)));
  console.log(chalk.cyan(`Total files processed: ${stats.totalFiles}`));
  console.log(chalk.green(`✓ Successfully optimized: ${stats.processedFiles}`));
  
  if (stats.skippedFiles > 0) {
    console.log(chalk.yellow(`⏭️  Skipped: ${stats.skippedFiles}`));
  }
  
  console.log(chalk.cyan(`💾 Total space saved: ${formatSize(stats.totalSaved)}`));
  
  // Print stats by file type
  console.log('\n' + chalk.cyan('📂 By file type:'));
  for (const [type, data] of Object.entries(stats.byType)) {
    console.log(`  ${type.toUpperCase()}: ${data.count} files, saved ${formatSize(data.saved)}`);
  }
  
  console.log('\n' + chalk.green(`✨ Optimization completed in ${totalTime} seconds!`));
}

// Run the script
main().catch(error => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
});
