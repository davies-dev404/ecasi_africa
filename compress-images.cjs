const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const folder = path.join(__dirname, "public/images/Gallery");

if (!fs.existsSync(folder)) {
    console.error(`Gallery folder does not exist: ${folder}`);
    process.exit(1);
}

const files = fs.readdirSync(folder);

(async () => {
    for (const file of files) {
        const ext = path.extname(file).toLowerCase();

        if (![".jpg", ".jpeg", ".png"].includes(ext)) continue;

        const input = path.join(folder, file);
        const temp = path.join(folder, "temp_" + file);

        try {
            await sharp(input)
                .rotate()
                .resize({
                    width: 1920,
                    withoutEnlargement: true,
                })
                .jpeg({
                    quality: 80,
                    mozjpeg: true,
                })
                .toFile(temp);

            fs.unlinkSync(input);
            fs.renameSync(temp, input);

            console.log("✓ Compressed:", file);
        } catch (err) {
            console.log("✗ Failed:", file);
            console.error(err.message);
        }
    }

    console.log("\nAll images compressed successfully!");
})();
