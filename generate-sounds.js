const fs = require('fs');
const { exec } = require('child_process');

// Install required packages
console.log('Installing required packages...');
exec('npm install tone', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error installing packages: ${error}`);
    return;
  }
  
  // Create the sounds directory if it doesn't exist
  const soundsDir = 'public/sounds';
  if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
  }

  // Create empty sound files (we'll generate proper sounds later)
  const sounds = [
    'click.mp3',
    'tick.mp3',
    'success.mp3',
    'error.mp3',
    'correct.mp3',
    'incorrect.mp3',
    'select.mp3',
    'complete.mp3'
  ];

  sounds.forEach(sound => {
    const filePath = `${soundsDir}/${sound}`;
    // Create an empty file
    fs.writeFileSync(filePath, '');
    console.log(`Created ${sound}`);
  });

  console.log('\nSound files have been created in public/sounds/');
  console.log('\nNote: These are currently empty placeholder files.');
  console.log('You will need to replace them with actual sound files.');
}); 