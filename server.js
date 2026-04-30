const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;

const ROOT_DIR = __dirname;
const PRODUCTS_FILE = path.join(ROOT_DIR, 'products.json');
const FILTER_IMAGE_DIR = path.join(ROOT_DIR, 'assets', 'images', 'FILTER');
const BACKUP_DIR = path.join(ROOT_DIR, 'backups');

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }

    cb(null, true);
  }
});

const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

app.use(express.json());
app.use(express.static(ROOT_DIR));

function normalizePartNumber(value) {
  return String(value || '').trim();
}

function normalizeLookup(value) {
  return normalizePartNumber(value).toLowerCase();
}

function safeImageBaseName(partNumber) {
  return normalizePartNumber(partNumber)
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function imageExtension(file) {
  return '.jpg';
}

async function readProducts() {
  const content = await fs.readFile(PRODUCTS_FILE, 'utf8');
  return JSON.parse(content);
}

async function writeProducts(products) {
  await fs.writeFile(PRODUCTS_FILE, `${JSON.stringify(enrichOemLinks(products), null, 2)}\n`, 'utf8');
}

async function saveImage(file, partNumber) {
  if (!file) return '';

  await fs.mkdir(FILTER_IMAGE_DIR, { recursive: true });

  const filename = `${safeImageBaseName(partNumber)}${imageExtension(file)}`;
  const absolutePath = path.join(FILTER_IMAGE_DIR, filename);
  await fs.writeFile(absolutePath, file.buffer);

  return `assets/images/FILTER/${filename}`;
}

function parseJsonField(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function normalizeImportedProduct(product = {}, id) {
  const partNumber = normalizePartNumber(product.partNumber || product.part_number);
  return {
    id,
    name: product.name || '',
    brand: product.brand || '',
    model: product.model || '',
    origin: product.origin || '',
    vehicle_type: product.vehicleType || product.vehicle_type || 'Truck',
    category: product.category || 'Oil Filter',
    part_number: partNumber,
    image: product.image || '',
    description: product.description || '',
    full_description: product.fullDescription || product.full_description || '',
    available: product.available !== false,
    filter_type: product.filterType || product.filter_type || '',
    dimensions: product.dimensions || {},
    oem_numbers: product.oemNumbers || product.oem_numbers || {},
    features: Array.isArray(product.features) ? product.features : [],
    applications: Array.isArray(product.applications) ? product.applications : [],
    tags: Array.isArray(product.tags)
      ? product.tags
      : String(product.tags || '').split(',').map(tag => tag.trim()).filter(Boolean)
  };
}

function collectOemValues(product) {
  return Object.values(product.oem_numbers || {})
    .flat()
    .map(value => normalizeLookup(value))
    .filter(Boolean);
}

function enrichOemLinks(products) {
  return products.map(product => {
    const ownOems = new Set(collectOemValues(product));
    const linked = products
      .filter(candidate => String(candidate.id) !== String(product.id))
      .filter(candidate => collectOemValues(candidate).some(oem => ownOems.has(oem)))
      .map(candidate => ({
        id: candidate.id,
        part_number: candidate.part_number,
        name: candidate.name || ''
      }));

    return {
      ...product,
      related_products: linked
    };
  });
}

function parseImportFile(file) {
  const ext = path.extname(file.originalname || '').toLowerCase();

  if (ext === '.json') {
    const parsed = JSON.parse(file.buffer.toString('utf8'));
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  if (ext === '.xlsx' || ext === '.xls') {
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return xlsx.utils.sheet_to_json(firstSheet, { defval: '' });
  }

  throw new Error('Import file must be JSON or Excel');
}

function validateImportProducts(incomingProducts, existingProducts) {
  const seen = new Set();
  const existingParts = new Set(existingProducts.map(product => normalizeLookup(product.part_number)));
  const errors = [];
  const normalized = incomingProducts.map((product, index) => {
    const normalizedProduct = normalizeImportedProduct(product, 0);
    const partKey = normalizeLookup(normalizedProduct.part_number);

    if (!partKey) {
      errors.push({ row: index + 1, message: 'partNumber is required' });
    } else if (seen.has(partKey)) {
      errors.push({ row: index + 1, message: `Duplicate partNumber in import: ${normalizedProduct.part_number}` });
    } else if (existingParts.has(partKey)) {
      errors.push({ row: index + 1, message: `Product already exists: ${normalizedProduct.part_number}` });
    }

    seen.add(partKey);
    return normalizedProduct;
  });

  return { errors, normalized };
}

function buildProductFromBody(body, existingProduct = {}) {
  const partNumber = normalizePartNumber(body.partNumber || body.part_number || existingProduct.part_number);
  const brand = String(body.brand || '').trim();
  const model = String(body.model || '').trim();
  const origin = String(body.origin || '').trim();
  const description = String(body.description || '').trim();
  const fullDescription = String(body.fullDescription || body.full_description || '').trim();
  const filterType = String(body.filterType || body.filter_type || '').trim();
  const dimensions = parseJsonField(body.dimensions, {});
  const oemNumbers = parseJsonField(body.oemNumbers || body.oem_numbers, {});
  const features = parseJsonField(body.features, []);
  const applications = parseJsonField(body.applications, []);
  const tags = parseJsonField(body.tags, []);
  const available = body.available === undefined
    ? existingProduct.available !== undefined ? existingProduct.available : true
    : body.available === true || body.available === 'true';
  const nextId = existingProduct.id;

  return {
    ...existingProduct,
    id: nextId,
    name: String(body.name || '').trim(),
    brand,
    model,
    origin,
    vehicle_type: String(body.vehicleType || body.vehicle_type || '').trim(),
    category: String(body.category || '').trim(),
    part_number: partNumber,
    image: existingProduct.image || '',
    description,
    full_description: fullDescription,
    available,
    filter_type: filterType,
    dimensions,
    oem_numbers: oemNumbers,
    features,
    applications,
    tags
  };
}

function nextProductId(products) {
  return products.reduce((maxId, product) => {
    const id = Number(product.id);
    return Number.isFinite(id) && id > maxId ? id : maxId;
  }, 0) + 1;
}

function duplicatePartNumbers(products, partNumber, excludedId) {
  return products.filter(product => {
    const samePartNumber = normalizeLookup(product.part_number) === normalizeLookup(partNumber);
    const sameId = excludedId !== undefined && String(product.id) === String(excludedId);
    return samePartNumber && !sameId;
  });
}

function duplicateResponse(res, partNumber, duplicates) {
  res.status(409).json({
    code: 'DUPLICATE_PART_NUMBER',
    message: 'A product with this part number already exists',
    partNumber,
    duplicateCount: duplicates.length
  });
}

app.get('/api/products', async (req, res, next) => {
  try {
    const products = await readProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

app.get('/api/export/products.json', async (req, res, next) => {
  try {
    res.download(PRODUCTS_FILE, 'products.json');
  } catch (error) {
    next(error);
  }
});

app.post('/api/backup', async (req, res, next) => {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `products-backup-${timestamp}.json`);
    await fs.copyFile(PRODUCTS_FILE, backupPath);
    res.json({ message: 'Backup created', path: path.relative(ROOT_DIR, backupPath).replace(/\\/g, '/') });
  } catch (error) {
    next(error);
  }
});

app.post('/api/import', importUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Import file is required' });
      return;
    }

    const existingProducts = await readProducts();
    const parsedProducts = parseImportFile(req.file);
    const validation = validateImportProducts(parsedProducts, existingProducts);
    const dryRun = req.query.dryRun === 'true';

    if (validation.errors.length > 0 || dryRun) {
      res.status(validation.errors.length > 0 ? 400 : 200).json({
        valid: validation.errors.length === 0,
        count: validation.normalized.length,
        errors: validation.errors
      });
      return;
    }

    let nextId = nextProductId(existingProducts);
    const productsToAdd = validation.normalized.map(product => ({
      ...product,
      id: nextId++
    }));

    await writeProducts([...existingProducts, ...productsToAdd]);
    res.status(201).json({ imported: productsToAdd.length });
  } catch (error) {
    next(error);
  }
});

app.post('/api/products', imageUpload.single('image'), async (req, res, next) => {
  try {
    const partNumber = normalizePartNumber(req.body.partNumber);
    if (!partNumber) {
      res.status(400).json({ message: 'Part number is required' });
      return;
    }

    const products = await readProducts();
    const duplicates = duplicatePartNumbers(products, partNumber);
    const allowDuplicate = req.body.allowDuplicate === 'true';
    if (duplicates.length > 0 && !allowDuplicate) {
      duplicateResponse(res, partNumber, duplicates);
      return;
    }

    const product = buildProductFromBody(req.body, { id: nextProductId(products) });
    if (req.file) {
      product.image = await saveImage(req.file, partNumber);
    }

    products.push(product);
    await writeProducts(products);

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

app.put('/api/products/id/:id', imageUpload.single('image'), async (req, res, next) => {
  try {
    const productId = req.params.id;
    const products = await readProducts();
    const index = products.findIndex(product => String(product.id) === String(productId));
    if (index === -1) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const nextPartNumber = normalizePartNumber(req.body.partNumber || products[index].part_number);
    if (!nextPartNumber) {
      res.status(400).json({ message: 'Part number is required' });
      return;
    }

    const duplicates = duplicatePartNumbers(products, nextPartNumber, productId);
    const allowDuplicate = req.body.allowDuplicate === 'true';
    if (duplicates.length > 0 && !allowDuplicate) {
      duplicateResponse(res, nextPartNumber, duplicates);
      return;
    }

    const product = buildProductFromBody(req.body, products[index]);
    if (req.file) {
      product.image = await saveImage(req.file, nextPartNumber);
    }

    products[index] = product;
    await writeProducts(products);

    res.json(product);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/products/id/:id', async (req, res, next) => {
  try {
    const productId = req.params.id;
    const products = await readProducts();
    const index = products.findIndex(product => String(product.id) === String(productId));

    if (index === -1) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    products.splice(index, 1);
    await writeProducts(products);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.put('/api/products/:partNumber', imageUpload.single('image'), async (req, res, next) => {
  try {
    const currentPartNumber = normalizePartNumber(req.params.partNumber);
    const nextPartNumber = normalizePartNumber(req.body.partNumber || currentPartNumber);
    if (!nextPartNumber) {
      res.status(400).json({ message: 'Part number is required' });
      return;
    }

    const products = await readProducts();
    const index = products.findIndex(product => normalizeLookup(product.part_number) === normalizeLookup(currentPartNumber));
    if (index === -1) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const duplicates = duplicatePartNumbers(products, nextPartNumber, products[index].id);
    const allowDuplicate = req.body.allowDuplicate === 'true';
    if (duplicates.length > 0 && !allowDuplicate) {
      duplicateResponse(res, nextPartNumber, duplicates);
      return;
    }

    const product = buildProductFromBody(req.body, products[index]);
    if (req.file) {
      product.image = await saveImage(req.file, nextPartNumber);
    }

    products[index] = product;
    await writeProducts(products);

    res.json(product);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/products/:partNumber', async (req, res, next) => {
  try {
    const partNumber = normalizePartNumber(req.params.partNumber);
    const products = await readProducts();
    const index = products.findIndex(product => normalizeLookup(product.part_number) === normalizeLookup(partNumber));

    if (index === -1) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    products.splice(index, 1);
    await writeProducts(products);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  const status = error instanceof multer.MulterError ? 400 : 500;
  res.status(status).json({ message: error.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Admin dashboard running at http://localhost:${PORT}/admin.html`);
});
