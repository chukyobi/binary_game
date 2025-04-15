const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Install required packages if not already installed
const installPackages = () => {
  return new Promise((resolve, reject) => {
    exec('npm install -g @gltf-transform/cli', (error) => {
      if (error) {
        console.error('Error installing packages:', error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

// Convert FBX to GLB
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

// Process all FBX files in a directory
const processDirectory = async (directory) => {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await processDirectory(filePath);
    } else if (file.endsWith('.fbx')) {
      const outputPath = filePath.replace('.fbx', '.glb');
      await convertFbxToGlb(filePath, outputPath);
    }
  }
};

// Main function
const main = async () => {
  try {
    console.log('Installing required packages...');
    await installPackages();
    
    console.log('Starting conversion...');
    const modelsDir = path.join(__dirname, '../public/3d/models');
    await processDirectory(modelsDir);
    
    console.log('Conversion complete!');
  } catch (error) {
    console.error('Error:', error);
  }
};

main(); 