const fs = require('fs');
const path = require('path');
const { optimize } = require('svgo');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

// SVGO configuration
const svgoConfig = {
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
};

async function optimizeSvg(filePath) {
  try {
    const svg = await readFile(filePath, 'utf8');
    const result = optimize(svg, { path: filePath, ...svgoConfig });
    
    if (result.error) {
      console.error(`Error optimizing ${filePath}:`, result.error);
      return false;
    }
    
    await writeFile(filePath, result.data);
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

async function processDirectory(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else if (entry.name.endsWith('.svg')) {
        const stats = await stat(fullPath);
        const beforeSize = stats.size;
        
        console.log(`Optimizing: ${fullPath}`);
        const success = await optimizeSvg(fullPath);
        
        if (success) {
          const afterStats = await stat(fullPath);
          const afterSize = afterStats.size;
          const saved = beforeSize - afterSize;
          const savedPercent = ((saved / beforeSize) * 100).toFixed(2);
          
          console.log(`  ✓ Optimized: ${(beforeSize / 1024).toFixed(2)}KB → ${(afterSize / 1024).toFixed(2)}KB (saved ${savedPercent}%)`);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
  }
}

// Get directories from command line arguments or use default
const directories = process.argv.slice(2).length > 0 
  ? process.argv.slice(2) 
  : [
      path.join(__dirname, '..', 'data', 'logos'),
      path.join(__dirname, '..', 'frontend', 'dist', 'img')
    ];

// Run optimization
(async () => {
  console.log('🚀 Starting SVG optimization...\n');
  
  for (const dir of directories) {
    console.log(`📂 Processing directory: ${dir}`);
    await processDirectory(dir);
  }
  
  console.log('\n✨ SVG optimization complete!');
})();
