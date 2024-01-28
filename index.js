import fs from "fs";
import sharp from "sharp";

function formatBytes(bytes, decimals = 2) {
    if (!Number(bytes)) {
        return "0 Bytes";
    }

    const kbToBytes = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = [
        "Bytes",
        "KiB",
        "MiB",
        "GiB",
        "TiB",
        "PiB",
        "EiB",
        "ZiB",
        "YiB",
    ];

    const index = Math.floor(Math.log(bytes) / Math.log(kbToBytes));

    return `${parseFloat((bytes / Math.pow(kbToBytes, index)).toFixed(dm))} ${
        sizes[index]
    }`;
}

class TestImageFormat {
    images = [];
    results = {
        webp: [],
        png: [],
        jpeg: [],
        avif: [],
        heif: [],
    };

    constructor() {
        const images = [
            "./assets/image-1.jpg",
            "./assets/image-2.webp",
            "./assets/image-3.png",
            "./assets/image-4.avif",
            "./assets/image-5.jpeg",
            "./assets/image-6.heic",
        ];

        for (const image of images) {
            const content = fs.readFileSync(image);
            this.images.push(content);
        }
    }

    async toWebp(image) {
        const start = Date.now();
        const webp = await sharp(image).webp({ quality: 100 }).toBuffer();
        const end = Date.now();
        return { size: webp.length, duration: end - start };
    }

    async toPng(image) {
        const start = Date.now();
        const png = await sharp(image).png({ quality: 100 }).toBuffer();
        const end = Date.now();
        return { size: png.length, duration: end - start };
    }

    async toJpeg(image) {
        const start = Date.now();
        const jpeg = await sharp(image).jpeg({ quality: 100 }).toBuffer();
        const end = Date.now();
        return { size: jpeg.length, duration: end - start };
    }

    async toAvif(image) {
        const start = Date.now();
        const avif = await sharp(image).avif({ quality: 100 }).toBuffer();
        const end = Date.now();
        return { size: avif.length, duration: end - start };
    }

    async toHeif(image) {
        const start = Date.now();
        const avif = await sharp(image)
            .heif({ quality: 100, compression: "av1" })
            .toBuffer();
        const end = Date.now();
        return { size: avif.length, duration: end - start };
    }

    async run() {
        const webpPromises = this.images.map(async (image) => {
            const result = await this.toWebp(image);
            this.results.webp.push(result);
        });

        const pngPromises = this.images.map(async (image) => {
            const result = await this.toPng(image);
            this.results.png.push(result);
        });

        const jpegPromises = this.images.map(async (image) => {
            const result = await this.toJpeg(image);
            this.results.jpeg.push(result);
        });

        const avifPromises = this.images.map(async (image) => {
            const result = await this.toAvif(image);
            this.results.avif.push(result);
        });

        const heifPromises = this.images.map(async (image) => {
            const result = await this.toHeif(image);
            this.results.heif.push(result);
        });

        const webpAll = Promise.all(webpPromises);
        const pngAll = Promise.all(pngPromises);
        const jpegAll = Promise.all(jpegPromises);
        const avifAll = Promise.all(avifPromises);
        const heifAll = Promise.all(heifPromises);

        await Promise.all([heifAll, avifAll, pngAll, jpegAll, webpAll]);
        console.table(this.results);

        const originalSize = this.images.reduce(
            (prev, current) => prev + current.length,
            0
        );
        let total = {};
        Object.entries(this.results).forEach(([key, value]) => {
            const size = value.reduce(
                (prev, current) => prev + current.size,
                0
            );
            const duration = value.reduce(
                (prev, current) => prev + current.duration,
                0
            );

            const difference = originalSize - size;

            total[key] = {
                size,
                duration,
                isLess: size < originalSize,
                // positive: How mush we save storage, negative: how mush we lost storage
                difference,
                save: formatBytes(difference >= 0 ? difference : 0),
                lost: formatBytes(difference < 0 ? -difference : 0),
            };
        });

        console.log(`Original Size: ${originalSize}`);
        console.table(total);
    }
}

async function main() {
    const test = new TestImageFormat();
    await test.run();
}

main();
