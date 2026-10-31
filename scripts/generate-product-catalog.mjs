import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const databasePath = path.resolve('data', 'db.json');
const outputPath = path.resolve('dist', 'products.json');
const sourceImagesPath = path.resolve('src', 'assets', 'images');
const outputImagesPath = path.resolve('dist', 'static-images');
const publicImagesPath = path.resolve('public', 'static-images');
const database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));

const optimizeImagePath = (imagePath) =>
  imagePath
    .replace('/src/assets/images/', '/static-images/')
    .replace(/\.(?:jpe?g|png)$/i, '.webp');

const products = database.products
  .filter((product) => !product.isDraft)
  .map((product) => ({
    ...product,
    image: optimizeImagePath(product.image),
    secondaryImages: product.secondaryImages?.map(optimizeImagePath),
  }));

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.mkdirSync(outputImagesPath, { recursive: true });
fs.mkdirSync(publicImagesPath, { recursive: true });

const sourceImages = fs.readdirSync(sourceImagesPath).filter((file) => /\.(?:jpe?g|png)$/i.test(file));
await Promise.all(
  sourceImages.map(async (file) => {
    const isLogo = /logo/i.test(file);
    const webpName = `${path.parse(file).name}.webp`;
    await sharp(path.join(sourceImagesPath, file))
      .rotate()
      .resize({ width: isLogo ? 256 : 1280, withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(path.join(outputImagesPath, webpName));

    // Guarantee that both public/ and dist/ have both webp and original jpg
    fs.copyFileSync(path.join(outputImagesPath, webpName), path.join(publicImagesPath, webpName));
    fs.copyFileSync(path.join(sourceImagesPath, file), path.join(publicImagesPath, file));
    fs.copyFileSync(path.join(sourceImagesPath, file), path.join(outputImagesPath, file));
  })
);

fs.writeFileSync(outputPath, JSON.stringify({ products, total: products.length }, null, 2));
console.log('Successfully generated catalog & static images in both public/ and dist/ directories.');
