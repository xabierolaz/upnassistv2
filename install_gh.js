const fs = require('fs');
const https = require('https');
const path = require('path');
const { execSync } = require('child_process');

const ZIP_URL = "https://github.com/cli/cli/releases/download/v2.62.0/gh_2.62.0_windows_amd64.zip";
const DEST_ZIP = "gh_cli.zip";
const EXTRACT_DIR = "gh_cli";

console.log("Downloading GitHub CLI...");
const file = fs.createWriteStream(DEST_ZIP);

https.get(ZIP_URL, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (redirectResponse) => {
             redirectResponse.pipe(file);
             file.on('finish', () => {
                 file.close();
                 console.log("Download complete. Extracting...");
                 try {
                    execSync(`tar -xf ${DEST_ZIP}`);
                    console.log("Extracted.");
                 } catch (e) {
                     console.error("Extraction failed (tar might not be available):", e.message);
                 }
             });
        });
        return;
    }
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log("Download complete. Extracting...");
        try {
            execSync(`tar -xf ${DEST_ZIP}`);
            console.log("Extracted.");
        } catch (e) {
            console.error("Extraction failed:", e.message);
        }
    });
}).on('error', (err) => {
    console.error("Error:", err.message);
});
