const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const MODELS_DIR = path.join(__dirname, '../public/3d/models');

// Function to rename files to follow our convention
const renameFiles = (directory) => {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      renameFiles(filePath);
    } else {
      // Rename model files
      if (file.toLowerCase().includes('model') && !file.endsWith('.glb')) {
        const newPath = path.join(directory, 'model.glb');
        fs.renameSync(filePath, newPath);
        console.log(`Renamed ${file} to model.glb`);
      }
      
      // Rename animation files
      if (file.endsWith('.fbx')) {
        const newName = file
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/\.fbx$/, '.glb');
        const newPath = path.join(directory, newName);
        fs.renameSync(filePath, newPath);
        console.log(`Renamed ${file} to ${newName}`);
      }
    }
  });
};

// Function to convert FBX to GLB
const convertFbxToGlb = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    exec(`gltf-transform fbx ${inputPath} ${outputPath}`, (error) => {
      if (error) {
        console.error(`Error converting ${inputPath}:`, error);
        reject(error);
      } else {
        console.log(`Successfully converted ${inputPath} to ${outputPath}`);
        resolve();
      }
    });
  });
};

// Main function
const main = async () => {
  try {
    console.log('Starting model setup...');
    
    // First, rename all files to follow our convention
    console.log('\nRenaming files...');
    renameFiles(MODELS_DIR);
    
    console.log('\nSetup complete! Your models are now properly organized.');
    console.log('\nNext steps:');
    console.log('1. Make sure all your model files end with .glb');
    console.log('2. Run the conversion script: npm run convert-models');
    console.log('3. Test your models in the game');
    
  } catch (error) {
    console.error('Error:', error);
  }
};

main(); 