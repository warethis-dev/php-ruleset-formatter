const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'src', 'default-ruleset-template.xml');
const destinationDirectory = path.join(__dirname, '..', 'out');
const destination = path.join(destinationDirectory, 'default-ruleset-template.xml');

fs.mkdirSync(destinationDirectory, { recursive: true });
fs.copyFileSync(source, destination);
