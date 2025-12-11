/**
 * R3SN Line Counter - Count all lines of code in the project
 */

const fs = require('fs');
const path = require('path');

const fileCategories = {
  backend: {
    patterns: ['backend/**/*.js'],
    exclude: ['node_modules', 'test', '.git']
  },
  android: {
    patterns: ['android/**/*.kt', 'android/**/*.xml', 'android/**/*.gradle', 'android/**/*.pro'],
    exclude: ['build', 'node_modules', '.gradle']
  },
  plugins: {
    patterns: ['plugins/**/*.js', 'plugins/**/*.json'],
    exclude: ['node_modules']
  },
  docs: {
    patterns: ['*.md', 'docs/**/*.md'],
    exclude: []
  },
  config: {
    patterns: ['*.json', '*.js', '*.sh', '*.bat', '.env*', 'Dockerfile', 'docker-compose.yml'],
    exclude: ['node_modules', 'package-lock.json']
  }
};

function countLinesInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    return lines;
  } catch (error) {
    return 0;
  }
}

function shouldExclude(filePath, excludePatterns) {
  return excludePatterns.some(pattern => filePath.includes(pattern));
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      if (!shouldExclude(filePath, ['node_modules', '.git', 'build', '.gradle'])) {
        getAllFiles(filePath, fileList);
      }
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function matchesPattern(filePath, patterns) {
  return patterns.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
    return regex.test(filePath);
  });
}

function countLines() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 R3SN PROJECT - COMPREHENSIVE LINE COUNT');
  console.log('='.repeat(70) + '\n');

  const results = {};
  let totalLines = 0;
  let totalFiles = 0;

  // Get all files in project
  const allFiles = getAllFiles('.');

  // Count by category
  Object.entries(fileCategories).forEach(([category, config]) => {
    const categoryFiles = allFiles.filter(file => 
      matchesPattern(file, config.patterns) && 
      !shouldExclude(file, config.exclude)
    );

    let categoryLines = 0;
    const fileDetails = [];

    categoryFiles.forEach(file => {
      const lines = countLinesInFile(file);
      categoryLines += lines;
      fileDetails.push({ file, lines });
    });

    results[category] = {
      files: categoryFiles.length,
      lines: categoryLines,
      details: fileDetails.sort((a, b) => b.lines - a.lines)
    };

    totalLines += categoryLines;
    totalFiles += categoryFiles.length;
  });

  // Print results
  Object.entries(results).forEach(([category, data]) => {
    console.log(`\n📦 ${category.toUpperCase()}`);
    console.log('-'.repeat(70));
    console.log(`Files: ${data.files}`);
    console.log(`Lines: ${data.lines.toLocaleString()}`);
    
    if (data.details.length > 0) {
      console.log('\nTop files:');
      data.details.slice(0, 5).forEach(({ file, lines }) => {
        const shortPath = file.length > 50 ? '...' + file.slice(-47) : file;
        console.log(`  ${lines.toString().padStart(6)} lines - ${shortPath}`);
      });
    }
  });

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📈 TOTAL SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Files: ${totalFiles}`);
  console.log(`Total Lines: ${totalLines.toLocaleString()}`);
  console.log('='.repeat(70) + '\n');

  // Breakdown
  console.log('📊 BREAKDOWN BY CATEGORY:\n');
  Object.entries(results).forEach(([category, data]) => {
    const percentage = ((data.lines / totalLines) * 100).toFixed(1);
    console.log(`${category.padEnd(15)} ${data.lines.toString().padStart(7)} lines (${percentage}%)`);
  });

  console.log('\n' + '='.repeat(70) + '\n');

  return { results, totalLines, totalFiles };
}

// Run if executed directly
if (require.main === module) {
  countLines();
}

module.exports = countLines;
