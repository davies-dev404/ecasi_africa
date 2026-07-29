const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// CHANGE THIS if Ghostscript is installed elsewhere
const gs = 'C:\\Program Files (x86)\\gs\\gs10.07.1\\bin\\gswin32c.exe';

const inputDir = path.join(__dirname, "public/pdfs");
const outputDir = path.join(__dirname, "public/pdfs_compressed");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function compressFolder(folder, outFolder) {
    if (!fs.existsSync(outFolder)) {
        fs.mkdirSync(outFolder, { recursive: true });
    }

    const items = fs.readdirSync(folder);

    for (const item of items) {
        const input = path.join(folder, item);
        const output = path.join(outFolder, item);

        if (fs.statSync(input).isDirectory()) {
            compressFolder(input, output);
            continue;
        }

        if (!item.toLowerCase().endsWith(".pdf")) continue;

        console.log("Compressing:", item);

        const cmd = `"${gs}" -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${output}" "${input}"`;

        try {
            execSync(cmd);
        } catch (err) {
            console.log("Failed:", item);
            console.error(err.message);
        }
    }
}

compressFolder(inputDir, outputDir);

console.log("Done!");
