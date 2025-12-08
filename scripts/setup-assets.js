const fs = require('fs');
const https = require('https');
const path = require('path');

const DEST_DIR = path.join(__dirname, '..', 'public');
const DEST_FILE = path.join(DEST_DIR, 'junit.jar');
const URL = "https://repo1.maven.org/maven2/org/junit/platform/junit-platform-console-standalone/1.10.0/junit-platform-console-standalone-1.10.0.jar";

if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

console.log('Checking for JUnit JAR...');

if (fs.existsSync(DEST_FILE)) {
    console.log('JUnit JAR already exists. Skipping download.');
} else {
    console.log('Downloading JUnit JAR...');
    const file = fs.createWriteStream(DEST_FILE);
    https.get(URL, function(response) {
        if (response.statusCode !== 200) {
            console.error(`Failed to download: ${response.statusCode}`);
            process.exit(1);
        }
        response.pipe(file);
        file.on('finish', function() {
            file.close();
            console.log("Download completed successfully.");
        });
    }).on('error', function(err) {
        fs.unlink(DEST_FILE, () => {}); // Delete partial file
        console.error("Error downloading file:", err.message);
        process.exit(1);
    });
}
