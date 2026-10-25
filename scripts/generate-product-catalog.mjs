import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const databasePath = path.resolve('data', 'db.json');
const outputPath = path.resolve('dist', 'products.json');
const sourceImagesPath = path.resolve('src', 'assets', 'images');
const outputImagesPath = path.resolve('dist', 'static-images');
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

const sourceImages = fs.readdirSync(sourceImagesPath).filter((file) => /\.(?:jpe?g|png)$/i.test(file));
await Promise.all(
  sourceImages.map(async (file) => {
    const isLogo = /logo/i.test(file);
    await sharp(path.join(sourceImagesPath, file))
      .rotate()
      .resize({ width: isLogo ? 256 : 1280, withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(path.join(outputImagesPath, `${path.parse(file).name}.webp`));
  })
);

fs.writeFileSync(outputPath, JSON.stringify({ products, total: products.length }, null, 2));
