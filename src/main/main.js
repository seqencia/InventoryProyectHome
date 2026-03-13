const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const XLSX = require('xlsx');
const { DataSource, EntitySchema, In } = require('typeorm');

const hashPassword = (p) => crypto.createHash('sha256').update(p).digest('hex');

// ── Backup helpers ─────────────────────────────────────────────────────────

const dbPath = () => path.join(app.getPath('userData'), 'database.sqlite');
const backupsDir = () => path.join(app.getPath('userData'), 'backups');
const configPath = () => path.join(app.getPath('userData'), 'config.json');

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(configPath(), 'utf8')); }
  catch { return { autoBackup: false }; }
}
function saveConfig(cfg) {
  fs.writeFileSync(configPath(), JSON.stringify(cfg, null, 2));
}

async function runAutoBackup() {
  const cfg = loadConfig();
  if (!cfg.autoBackup) return;
  const dir = backupsDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const dest = path.join(dir, `backup-${today}.sqlite`);
  if (!fs.existsSync(dest) && fs.existsSync(dbPath())) {
    fs.copyFileSync(dbPath(), dest);
  }
}

let mainWindow = null;

// ── Schemas ────────────────────────────────────────────────────────────────

const ProductSchema = new EntitySchema({
  name: 'Product',
  tableName: 'products',
  columns: {
    id: { type: Number, primary: true, generated: true },
    sku: { type: String, nullable: true, unique: true },
    barcode: { type: String, nullable: true, unique: true },
    serial_number: { type: String, nullable: true },
    name: { type: String },
    description: { type: String, nullable: true },
    technical_notes: { type: String, nullable: true },
    category: { type: String, nullable: true },
    condition: { type: String, nullable: true },
    status: { type: String, nullable: true, default: 'Disponible' },
    disponible_regalia: { type: Boolean, nullable: true, default: false },
    cost_price: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    // sale_price maps to the existing 'price' DB column — zero-migration rename
    sale_price: { type: 'decimal', precision: 10, scale: 2, name: 'price' },
    offer_price: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    // Extended pricing model — 6 decimal places for monetary precision
    precio_costo:         { type: 'decimal', precision: 16, scale: 6, nullable: true },
    precio_venta_sin_iva: { type: 'decimal', precision: 16, scale: 6, nullable: true },
    precio_venta_con_iva: { type: 'decimal', precision: 16, scale: 6, nullable: true },
    descuento_monto:      { type: 'decimal', precision: 16, scale: 6, nullable: true, default: 0 },
    descuento_porcentaje: { type: 'decimal', precision: 16, scale: 6, nullable: true, default: 0 },
    precio_neto:          { type: 'decimal', precision: 16, scale: 6, nullable: true },
    utilidad:             { type: 'decimal', precision: 16, scale: 6, nullable: true },
    stock: { type: Number },
    min_stock: { type: Number, nullable: true, default: 5 },
    location: { type: String, nullable: true },
    created_at: { type: 'datetime', createDate: true },
    updated_at: { type: 'datetime', updateDate: true },
  },
});

const CategorySchema = new EntitySchema({
  name: 'Category',
  tableName: 'categories',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String, unique: true },
    description: { type: String, nullable: true, default: '' },
  },
});

const CustomerSchema = new EntitySchema({
  name: 'Customer',
  tableName: 'customers',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
    phone: { type: String, nullable: true },
    email: { type: String, nullable: true },
    created_at: { type: 'datetime', createDate: true },
  },
});

const SaleSchema = new EntitySchema({
  name: 'Sale',
  tableName: 'sales',
  columns: {
    id: { type: Number, primary: true, generated: true },
    payment_method: { type: String, nullable: true, default: 'Efectivo' },
    status: { type: String, nullable: true, default: 'Completada' },
    subtotal: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    tax: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    total: { type: 'decimal', precision: 10, scale: 2 },
    profit: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    global_discount: { type: 'decimal', precision: 16, scale: 6, nullable: true, default: 0 },
    regalia_count: { type: Number, nullable: true, default: 0 },
    customer_id: { type: Number, nullable: true },
    customer_name: { type: String, nullable: true },
    created_at: { type: 'datetime', createDate: true, index: true },
  },
});

const SupplierSchema = new EntitySchema({
  name: 'Supplier',
  tableName: 'suppliers',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
    phone: { type: String, nullable: true },
    email: { type: String, nullable: true },
    address: { type: String, nullable: true },
    notes: { type: String, nullable: true },
    created_at: { type: 'datetime', createDate: true },
  },
});

const StockEntrySchema = new EntitySchema({
  name: 'StockEntry',
  tableName: 'stock_entries',
  columns: {
    id: { type: Number, primary: true, generated: true },
    product_id: { type: Number, index: true },
    product_name: { type: String },
    quantity: { type: Number },
    bonus_quantity: { type: Number, nullable: true, default: 0 },
    unit_cost: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    supplier_id: { type: Number, nullable: true },
    supplier_name: { type: String, nullable: true },
    notes: { type: String, nullable: true },
    precio_venta_bonificacion: { type: 'decimal', precision: 16, scale: 6, nullable: true },
    precio_bonificacion_pendiente: { type: Boolean, nullable: true, default: false },
    created_at: { type: 'datetime', createDate: true },
  },
});

const SaleDetailSchema = new EntitySchema({
  name: 'SaleDetail',
  tableName: 'sale_details',
  columns: {
    id: { type: Number, primary: true, generated: true },
    sale_id: { type: Number, index: true },
    product_id: { type: Number, index: true },
    product_name: { type: String },
    quantity: { type: Number },
    unit_price: { type: 'decimal', precision: 10, scale: 2 },
    subtotal: { type: 'decimal', precision: 10, scale: 2 },
    is_regalia: { type: Boolean, nullable: true, default: false },
    regalia_type: { type: String, nullable: true }, // 'propia' | 'bonificacion' | null
    // Pricing snapshot at time of sale — 6 decimal places
    cost_price:          { type: 'decimal', precision: 16, scale: 6, nullable: true },
    discount_amount:     { type: 'decimal', precision: 16, scale: 6, nullable: true, default: 0 },
    discount_percentage: { type: 'decimal', precision: 16, scale: 6, nullable: true, default: 0 },
    iva_amount:          { type: 'decimal', precision: 16, scale: 6, nullable: true },
    line_total:          { type: 'decimal', precision: 16, scale: 6, nullable: true },
  },
});

const ReturnSchema = new EntitySchema({
  name: 'Return',
  tableName: 'returns',
  columns: {
    id: { type: Number, primary: true, generated: true },
    sale_id: { type: Number, index: true },
    reason: { type: String },
    notes: { type: String, nullable: true },
    total_refunded: { type: 'decimal', precision: 10, scale: 2 },
    is_partial: { type: Boolean, default: false },
    created_at: { type: 'datetime', createDate: true, index: true },
  },
});

const ReturnDetailSchema = new EntitySchema({
  name: 'ReturnDetail',
  tableName: 'return_details',
  columns: {
    id: { type: Number, primary: true, generated: true },
    return_id: { type: Number, index: true },
    product_id: { type: Number, index: true },
    product_name: { type: String },
    quantity: { type: Number },
    unit_price: { type: 'decimal', precision: 10, scale: 2 },
    subtotal: { type: 'decimal', precision: 10, scale: 2 },
  },
});

const BonificacionPriceLogSchema = new EntitySchema({
  name: 'BonificacionPriceLog',
  tableName: 'bonificacion_price_logs',
  columns: {
    id: { type: Number, primary: true, generated: true },
    product_id: { type: Number },
    product_name: { type: String },
    previous_price: { type: 'decimal', precision: 16, scale: 6, nullable: true },
    new_price: { type: 'decimal', precision: 16, scale: 6 },
    notes: { type: String, nullable: true },
    created_at: { type: 'datetime', createDate: true },
  },
});

const UserSchema = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
    username: { type: String, unique: true },
    password_hash: { type: String },
    role: { type: String }, // 'Admin' | 'Vendedor'
    created_at: { type: 'datetime', createDate: true },
  },
});

const AuditLogSchema = new EntitySchema({
  name: 'AuditLog',
  tableName: 'audit_logs',
  columns: {
    id: { type: Number, primary: true, generated: true },
    user_id: { type: Number, nullable: true },
    user_name: { type: String, nullable: true },
    action: { type: String }, // CREATE | UPDATE | DELETE | LOGIN | LOGOUT
    entity: { type: String, nullable: true }, // product | sale | return | stock_entry | user | category | supplier | customer
    entity_id: { type: Number, nullable: true },
    old_value: { type: String, nullable: true }, // JSON string
    new_value: { type: String, nullable: true }, // JSON string
    timestamp: { type: 'datetime', createDate: true },
  },
});

// ── Database ───────────────────────────────────────────────────────────────

let AppDataSource;
let currentSession = null; // { userId, userName } — set on login, cleared on logout

async function initDatabase() {
  AppDataSource = new DataSource({
    type: 'sqlite',
    database: path.join(app.getPath('userData'), 'database.sqlite'),
    entities: [ProductSchema, CategorySchema, CustomerSchema, SaleSchema, SaleDetailSchema, SupplierSchema, StockEntrySchema, ReturnSchema, ReturnDetailSchema, BonificacionPriceLogSchema, UserSchema, AuditLogSchema],
    synchronize: true,
    logging: false,
  });
  await AppDataSource.initialize();
}

async function seedDefaultAdmin() {
  const userRepo = AppDataSource.getRepository('User');
  const count = await userRepo.count();
  if (count === 0) {
    await userRepo.save(userRepo.create({
      name: 'Administrador',
      username: 'admin',
      password_hash: hashPassword('admin'),
      role: 'Admin',
    }));
  }
}

// ── Audit log helper ───────────────────────────────────────────────────────

async function logAudit({ action, entity, entityId, oldValue, newValue }) {
  try {
    const r = AppDataSource.getRepository('AuditLog');
    await r.save(r.create({
      user_id:   currentSession?.userId  ?? null,
      user_name: currentSession?.userName ?? null,
      action,
      entity:    entity    ?? null,
      entity_id: entityId  ?? null,
      old_value: oldValue  != null ? JSON.stringify(oldValue)  : null,
      new_value: newValue  != null ? JSON.stringify(newValue)  : null,
    }));
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// ── Pricing helpers ────────────────────────────────────────────────────────

const r6 = (v) => parseFloat(Number(v).toFixed(6));

function computePricing({ precio_costo, precio_venta_sin_iva, descuento_monto, descuento_porcentaje }) {
  const sinIva = parseFloat(precio_venta_sin_iva) || 0;
  const costo  = parseFloat(precio_costo) || 0;
  const dMonto = parseFloat(descuento_monto) || 0;
  const dPorc  = parseFloat(descuento_porcentaje) || 0;
  const conIva = r6(sinIva * 1.13);
  const neto   = r6(Math.max(0, sinIva * (1 - dPorc / 100) - dMonto));
  const util   = r6(neto - costo);
  return {
    precio_venta_con_iva: sinIva > 0 ? conIva : null,
    precio_neto:          sinIva > 0 ? neto   : null,
    utilidad:             (sinIva > 0 || costo > 0) ? util : null,
  };
}

// ── IPC Handlers ───────────────────────────────────────────────────────────

function setupIpcHandlers() {
  const repo = (name) => AppDataSource.getRepository(name);

  // Products
  ipcMain.handle('products:getAll', async () => {
    return await repo('Product').find({ order: { name: 'ASC' } });
  });

  ipcMain.handle('products:create', async (_, data) => {
    if (!data.sku || !data.sku.trim()) {
      data.sku = 'PRD-' + Date.now().toString(36).toUpperCase().slice(-6);
    }
    if (data.stock == null) data.stock = 0;
    // Validate barcode uniqueness
    if (data.barcode) {
      const dup = await repo('Product').findOneBy({ barcode: data.barcode });
      if (dup) throw new Error(`El código de barras "${data.barcode}" ya está asignado al producto "${dup.name}".`);
    }
    // Compute derived pricing fields
    if (data.precio_venta_sin_iva != null) {
      Object.assign(data, computePricing(data));
      // Keep legacy fields in sync for backward compat
      data.sale_price = data.precio_venta_sin_iva;
      if (data.precio_costo != null) data.cost_price = data.precio_costo;
    }
    const saved = await repo('Product').save(repo('Product').create(data));
    await logAudit({ action: 'CREATE', entity: 'product', entityId: saved.id, newValue: { name: saved.name, sku: saved.sku, precio_venta_sin_iva: saved.precio_venta_sin_iva, precio_costo: saved.precio_costo, stock: saved.stock } });
    return saved;
  });

  ipcMain.handle('products:update', async (_, { id, ...data }) => {
    // Validate barcode uniqueness (excluding this product)
    if (data.barcode) {
      const dup = await repo('Product').findOneBy({ barcode: data.barcode });
      if (dup && dup.id !== id) throw new Error(`El código de barras "${data.barcode}" ya está asignado al producto "${dup.name}".`);
    }
    const oldProduct = await repo('Product').findOneBy({ id });
    // Compute derived pricing fields
    if (data.precio_venta_sin_iva != null) {
      Object.assign(data, computePricing(data));
      data.sale_price = data.precio_venta_sin_iva;
      if (data.precio_costo != null) data.cost_price = data.precio_costo;
    }
    await repo('Product').update(id, data);
    const updated = await repo('Product').findOneBy({ id });
    await logAudit({
      action: 'UPDATE', entity: 'product', entityId: id,
      oldValue: oldProduct ? { name: oldProduct.name, precio_venta_sin_iva: oldProduct.precio_venta_sin_iva, precio_costo: oldProduct.precio_costo, stock: oldProduct.stock, status: oldProduct.status } : null,
      newValue: updated   ? { name: updated.name,   precio_venta_sin_iva: updated.precio_venta_sin_iva,   precio_costo: updated.precio_costo,   stock: updated.stock,   status: updated.status   } : null,
    });
    return updated;
  });

  ipcMain.handle('products:delete', async (_, id) => {
    const old = await repo('Product').findOneBy({ id });
    await repo('Product').delete(id);
    await logAudit({ action: 'DELETE', entity: 'product', entityId: id, oldValue: old ? { name: old.name, sku: old.sku, stock: old.stock } : null });
    return { success: true };
  });

  ipcMain.handle('products:getBonificacionInfo', async (_, productId) => {
    const entries = await repo('StockEntry').find({ where: { product_id: productId } });
    const totalBonifiedUnits = entries.reduce((s, e) => s + (Number(e.bonus_quantity) || 0), 0);
    // Most recent stock entry with a precio_venta_bonificacion set
    const withPrice = entries
      .filter((e) => e.precio_venta_bonificacion != null)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const currentPrice = withPrice.length > 0 ? Number(withPrice[0].precio_venta_bonificacion) : null;
    const priceHistory = await repo('BonificacionPriceLog').find({
      where: { product_id: productId },
      order: { created_at: 'DESC' },
      take: 10,
    });
    return { totalBonifiedUnits, currentPrice, priceHistory };
  });

  ipcMain.handle('products:updateBonificacionPrice', async (_, { productId, productName, newPrice }) => {
    const product = await repo('Product').findOneBy({ id: productId });
    if (!product) throw new Error('Producto no encontrado');
    const previousPrice = product.precio_venta_sin_iva != null ? Number(product.precio_venta_sin_iva) : null;
    const pricing = computePricing({
      precio_costo: product.precio_costo,
      precio_venta_sin_iva: newPrice,
      descuento_monto: product.descuento_monto || 0,
      descuento_porcentaje: product.descuento_porcentaje || 0,
    });
    await repo('Product').update(productId, {
      precio_venta_sin_iva: r6(newPrice),
      sale_price: r6(newPrice),
      ...pricing,
    });
    await repo('BonificacionPriceLog').save(
      repo('BonificacionPriceLog').create({
        product_id: productId,
        product_name: productName,
        previous_price: previousPrice != null ? r6(previousPrice) : null,
        new_price: r6(newPrice),
      })
    );
    await logAudit({
      action: 'UPDATE', entity: 'product', entityId: productId,
      oldValue: { name: productName, precio_venta_sin_iva: previousPrice },
      newValue: { name: productName, precio_venta_sin_iva: r6(newPrice), _note: 'precio_bonificacion' },
    });
    return { success: true };
  });

  // Categories
  ipcMain.handle('categories:getAll', async () => {
    return await repo('Category').find({ order: { name: 'ASC' } });
  });

  ipcMain.handle('categories:create', async (_, data) => {
    return await repo('Category').save(repo('Category').create(data));
  });

  ipcMain.handle('categories:update', async (_, { id, ...data }) => {
    await repo('Category').update(id, data);
    return await repo('Category').findOneBy({ id });
  });

  ipcMain.handle('categories:delete', async (_, id) => {
    await repo('Category').delete(id);
    return { success: true };
  });

  // Dashboard
  ipcMain.handle('dashboard:getSummary', async () => {
    const [allSales, allDetails, allProducts, allReturns] = await Promise.all([
      repo('Sale').find({ order: { created_at: 'DESC' } }),
      repo('SaleDetail').find(),
      repo('Product').find(),
      repo('Return').find({ order: { created_at: 'DESC' } }),
    ]);

    // Today's sales (local midnight)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySales = allSales.filter((s) => new Date(s.created_at) >= todayStart);
    const todayTotal = todaySales.reduce((sum, s) => sum + Number(s.total), 0);
    const todayCount = todaySales.length;
    const todayProfit = todaySales.reduce((sum, s) => sum + Number(s.profit || 0), 0);

    // Today's regalia cost (only propia type)
    const todaySaleIds = new Set(todaySales.map((s) => s.id));
    const todayDetails = allDetails.filter((d) => todaySaleIds.has(d.sale_id));
    const todayRegaliaCost = todayDetails
      .filter((d) => d.regalia_type === 'propia')
      .reduce((s, d) => s + Number(d.cost_price || 0) * d.quantity, 0);

    // Today's returns
    const todayReturns = allReturns.filter((r) => new Date(r.created_at) >= todayStart);
    const todayReturnCount = todayReturns.length;
    const todayReturnTotal = todayReturns.reduce((sum, r) => sum + Number(r.total_refunded), 0);

    // Low stock — respect each product's individual minimum
    const lowStock = allProducts
      .filter((p) => p.stock <= (p.min_stock ?? 5))
      .sort((a, b) => a.stock - b.stock);

    // Top 5 best selling (aggregate by product_id across all history)
    const soldMap = {};
    for (const d of allDetails) {
      if (!soldMap[d.product_id]) {
        soldMap[d.product_id] = { product_id: d.product_id, product_name: d.product_name, total_sold: 0 };
      }
      soldMap[d.product_id].total_sold += d.quantity;
    }
    const topProducts = Object.values(soldMap)
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 5);

    // Recent 5 sales
    const recentSales = allSales.slice(0, 5);

    return { todayTotal, todayCount, todayProfit, todayRegaliaCost, todayReturnCount, todayReturnTotal, lowStock, topProducts, recentSales };
  });

  // Customers
  ipcMain.handle('customers:getAll', async () => {
    return await repo('Customer').find({ order: { name: 'ASC' } });
  });

  ipcMain.handle('customers:create', async (_, data) => {
    return await repo('Customer').save(repo('Customer').create(data));
  });

  ipcMain.handle('customers:update', async (_, { id, ...data }) => {
    await repo('Customer').update(id, data);
    return await repo('Customer').findOneBy({ id });
  });

  ipcMain.handle('customers:delete', async (_, id) => {
    await repo('Customer').delete(id);
    return { success: true };
  });

  // Suppliers
  ipcMain.handle('suppliers:getAll', async () => {
    return await repo('Supplier').find({ order: { name: 'ASC' } });
  });

  ipcMain.handle('suppliers:create', async (_, data) => {
    return await repo('Supplier').save(repo('Supplier').create(data));
  });

  ipcMain.handle('suppliers:update', async (_, { id, ...data }) => {
    await repo('Supplier').update(id, data);
    return await repo('Supplier').findOneBy({ id });
  });

  ipcMain.handle('suppliers:delete', async (_, id) => {
    await repo('Supplier').delete(id);
    return { success: true };
  });

  // Stock Entries
  ipcMain.handle('stockEntries:getAll', async () => {
    return await repo('StockEntry').find({ order: { created_at: 'DESC' } });
  });

  ipcMain.handle('stockEntries:create', async (_, data) => {
    const entry = await AppDataSource.transaction(async (manager) => {
      const product = await manager.getRepository('Product').findOneBy({ id: data.product_id });
      if (!product) throw new Error('Producto no encontrado');

      let supplier_name = null;
      if (data.supplier_id) {
        const supplier = await manager.getRepository('Supplier').findOneBy({ id: data.supplier_id });
        supplier_name = supplier?.name ?? null;
      }

      const bonusQty = data.bonus_quantity || 0;
      const totalQty = data.quantity + bonusQty;

      const entry = await manager.save(
        'StockEntry',
        manager.create('StockEntry', {
          product_id: data.product_id,
          product_name: product.name,
          quantity: data.quantity,
          bonus_quantity: bonusQty,
          unit_cost: data.unit_cost || null,
          supplier_id: data.supplier_id || null,
          supplier_name,
          notes: data.notes || null,
        })
      );

      await manager.getRepository('Product').increment({ id: data.product_id }, 'stock', totalQty);
      return entry;
    });
    await logAudit({
      action: 'CREATE', entity: 'stock_entry', entityId: entry.id,
      newValue: { product_id: entry.product_id, product_name: entry.product_name, quantity: entry.quantity, bonus_quantity: entry.bonus_quantity, supplier_name: entry.supplier_name, unit_cost: entry.unit_cost },
    });
    return entry;
  });

  ipcMain.handle('stockEntries:updateBonificacion', async (_, { entryId, productId, precio_venta_bonificacion, precio_bonificacion_pendiente, updateProductPrice }) => {
    await repo('StockEntry').update(entryId, {
      precio_venta_bonificacion: precio_venta_bonificacion != null ? r6(precio_venta_bonificacion) : null,
      precio_bonificacion_pendiente: !!precio_bonificacion_pendiente,
    });
    if (updateProductPrice && precio_venta_bonificacion > 0) {
      const product = await repo('Product').findOneBy({ id: productId });
      if (product) {
        const pricing = computePricing({
          precio_costo: product.precio_costo,
          precio_venta_sin_iva: precio_venta_bonificacion,
          descuento_monto: product.descuento_monto || 0,
          descuento_porcentaje: product.descuento_porcentaje || 0,
        });
        await repo('Product').update(productId, {
          precio_venta_sin_iva: r6(precio_venta_bonificacion),
          sale_price: r6(precio_venta_bonificacion),
          ...pricing,
        });
      }
    }
    return { success: true };
  });

  // Sales
  ipcMain.handle('sales:create', async (_, { items, customerId, customerName, paymentMethod, status, globalDiscountAmount }) => {
    const savedSale = await AppDataSource.transaction(async (manager) => {
      const regularItems = items.filter((i) => !i.is_regalia);
      const regaliaItems = items.filter((i) => i.is_regalia);

      // Line subtotals already reflect per-line discounts (unit_price is effective price)
      const lineSubtotal = r6(regularItems.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0));
      const globalDisc = r6(parseFloat(globalDiscountAmount) || 0);
      const subtotal = r6(Math.max(0, lineSubtotal - globalDisc));
      const tax = r6(subtotal * 0.13);
      const total = r6(subtotal + tax);
      const regaliaCount = regaliaItems.reduce((sum, item) => sum + item.quantity, 0);

      // Profit: only from regular (non-regalía) items
      const productIds = items.map((i) => i.product_id);
      const products = await manager.getRepository('Product').find({ where: { id: In(productIds) } });
      const productMap = {};
      for (const p of products) productMap[p.id] = p;

      // Validate all products exist in DB
      for (const item of items) {
        if (!productMap[item.product_id]) throw new Error(`Producto ID ${item.product_id} no encontrado`);
      }

      let profit = 0;
      for (const item of regularItems) {
        const product = productMap[item.product_id];
        const costPrice = product?.precio_costo ?? product?.cost_price;
        if (product && costPrice != null) {
          profit = r6(profit + (item.unit_price - Number(costPrice)) * item.quantity);
        }
      }
      // Regalía propia: cost absorbed by business → reduces profit
      for (const item of regaliaItems.filter((i) => i.regalia_type === 'propia')) {
        const product = productMap[item.product_id];
        const costPrice = product?.precio_costo ?? product?.cost_price;
        if (product && costPrice != null) {
          profit = r6(profit - Number(costPrice) * item.quantity);
        }
      }

      const savedSale = await manager.save(
        'Sale',
        manager.create('Sale', {
          payment_method: paymentMethod || 'Efectivo',
          status: status || 'Completada',
          subtotal,
          tax,
          total,
          profit,
          global_discount: globalDisc,
          regalia_count: regaliaCount,
          customer_id: customerId || null,
          customer_name: customerName || null,
        })
      );

      for (const item of items) {
        const product = productMap[item.product_id];
        const costSnap = product?.precio_costo ?? product?.cost_price ?? null;
        const unitP    = item.is_regalia ? 0 : item.unit_price;
        const lineSub  = item.is_regalia ? 0 : item.subtotal;
        const ivaAmt   = item.is_regalia ? 0 : r6(lineSub * 0.13);
        const lineTotal = item.is_regalia ? 0 : r6(lineSub + ivaAmt);
        await manager.save(
          'SaleDetail',
          manager.create('SaleDetail', {
            sale_id: savedSale.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: unitP,
            subtotal: lineSub,
            is_regalia: item.is_regalia || false,
            regalia_type: item.regalia_type ?? null,
            // Pricing snapshot at time of sale
            cost_price:          item.is_regalia ? null : (costSnap != null ? r6(costSnap) : null),
            discount_amount:     item.is_regalia ? 0    : r6(item.discount_amount ?? 0),
            discount_percentage: item.is_regalia ? 0    : r6(item.discount_percentage ?? 0),
            iva_amount:          ivaAmt,
            line_total:          lineTotal,
          })
        );
        await manager
          .getRepository('Product')
          .decrement({ id: item.product_id }, 'stock', item.quantity);
      }

      return savedSale;
    });
    await logAudit({
      action: 'CREATE', entity: 'sale', entityId: savedSale.id,
      newValue: { total: savedSale.total, subtotal: savedSale.subtotal, payment_method: savedSale.payment_method, status: savedSale.status, customer_name: savedSale.customer_name, items_count: items.length },
    });
    return savedSale;
  });

  ipcMain.handle('sales:updateStatus', async (_, { id, status, payment_method }) => {
    const old = await repo('Sale').findOneBy({ id });
    const update = {};
    if (status) update.status = status;
    if (payment_method) update.payment_method = payment_method;
    await repo('Sale').update(id, update);
    const updated = await repo('Sale').findOneBy({ id });
    await logAudit({
      action: 'UPDATE', entity: 'sale', entityId: id,
      oldValue: old    ? { status: old.status,     payment_method: old.payment_method     } : null,
      newValue: updated ? { status: updated.status, payment_method: updated.payment_method } : null,
    });
    return updated;
  });

  ipcMain.handle('sales:getAll', async () => {
    const sales = await repo('Sale').find({ order: { created_at: 'DESC' } });
    const details = await repo('SaleDetail').find();
    return sales.map((sale) => ({
      ...sale,
      details: details.filter((d) => d.sale_id === sale.id),
    }));
  });

  // Returns
  ipcMain.handle('returns:create', async (_, { saleId, items, reason, notes }) => {
    const result = await AppDataSource.transaction(async (manager) => {
      // Get original sale details
      const originalDetails = await manager.getRepository('SaleDetail').find({ where: { sale_id: saleId } });

      // Build already-returned quantities per product_id for this sale
      const priorReturns = await manager.getRepository('Return').find({ where: { sale_id: saleId } });
      const alreadyReturnedMap = {};
      if (priorReturns.length > 0) {
        const priorReturnIds = priorReturns.map((r) => r.id);
        const priorDetails = await manager.getRepository('ReturnDetail').find({ where: { return_id: In(priorReturnIds) } });
        for (const d of priorDetails) {
          alreadyReturnedMap[d.product_id] = (alreadyReturnedMap[d.product_id] || 0) + d.quantity;
        }
      }

      // Validate: each returned quantity must not exceed original minus already returned
      const origMap = {};
      for (const d of originalDetails) origMap[d.product_id] = (origMap[d.product_id] || 0) + d.quantity;
      for (const item of items) {
        const originalQty = origMap[item.product_id] ?? 0;
        const alreadyReturned = alreadyReturnedMap[item.product_id] || 0;
        const maxReturnable = originalQty - alreadyReturned;
        if (item.quantity > maxReturnable) {
          throw new Error(`Cantidad inválida para "${item.product_name}": máximo devolvible es ${maxReturnable}`);
        }
      }

      const totalRefunded = items.reduce((sum, item) => sum + item.subtotal, 0);

      // Determine partial: consider prior returns + this return combined
      const totalReturnedMap = { ...alreadyReturnedMap };
      for (const item of items) {
        totalReturnedMap[item.product_id] = (totalReturnedMap[item.product_id] || 0) + item.quantity;
      }
      const isPartial = originalDetails.some((d) => (totalReturnedMap[d.product_id] || 0) < d.quantity);

      const savedReturn = await manager.save(
        'Return',
        manager.create('Return', {
          sale_id: saleId,
          reason,
          notes: notes || null,
          total_refunded: totalRefunded,
          is_partial: isPartial,
        })
      );

      for (const item of items) {
        await manager.save(
          'ReturnDetail',
          manager.create('ReturnDetail', {
            return_id: savedReturn.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
          })
        );
        await manager.getRepository('Product').increment({ id: item.product_id }, 'stock', item.quantity);
      }

      // Update sale status
      await manager.getRepository('Sale').update(saleId, { status: isPartial ? 'Parcial' : 'Devuelta' });

      return { ...savedReturn, is_partial: isPartial };
    });
    await logAudit({
      action: 'CREATE', entity: 'return', entityId: result.id,
      newValue: { sale_id: saleId, total_refunded: result.total_refunded, reason, is_partial: result.is_partial, items_count: items.length },
    });
    return result;
  });

  ipcMain.handle('returns:getAll', async () => {
    const returns = await repo('Return').find({ order: { created_at: 'DESC' } });
    const details = await repo('ReturnDetail').find();
    return returns.map((r) => ({
      ...r,
      details: details.filter((d) => d.return_id === r.id),
    }));
  });

  // Backup
  ipcMain.handle('backup:getInfo', async () => {
    const cfg = loadConfig();
    const dir = backupsDir();
    let lastBackup = null;
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir)
        .filter((f) => f.endsWith('.sqlite'))
        .map((f) => {
          const stat = fs.statSync(path.join(dir, f));
          return { name: f, date: stat.mtime, size: stat.size };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      if (files.length > 0) lastBackup = files[0];
    }
    return { autoBackup: cfg.autoBackup || false, lastBackup };
  });

  ipcMain.handle('backup:setAutoBackup', async (_, enabled) => {
    const cfg = loadConfig();
    cfg.autoBackup = enabled;
    saveConfig(cfg);
    return { success: true };
  });

  ipcMain.handle('backup:export', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Guardar copia de seguridad',
      defaultPath: `backup-${today}.sqlite`,
      filters: [{ name: 'Base de datos SQLite', extensions: ['sqlite'] }],
    });
    if (result.canceled || !result.filePath) return { canceled: true };
    fs.copyFileSync(dbPath(), result.filePath);
    const stat = fs.statSync(result.filePath);
    return { success: true, filePath: result.filePath, size: stat.size };
  });

  ipcMain.handle('backup:import', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Seleccionar copia de seguridad',
      filters: [{ name: 'Base de datos SQLite', extensions: ['sqlite'] }],
      properties: ['openFile'],
    });
    if (result.canceled || !result.filePaths.length) return { canceled: true };
    const backupFile = result.filePaths[0];
    const stat = fs.statSync(backupFile);
    // Return the selected file path so the renderer can show a confirmation modal
    return { selected: true, filePath: backupFile, size: stat.size };
  });

  ipcMain.handle('backup:restore', async (_, filePath) => {
    if (!filePath || !fs.existsSync(filePath)) throw new Error('Archivo no encontrado');
    await AppDataSource.destroy();
    fs.copyFileSync(filePath, dbPath());
    await AppDataSource.initialize();
    return { success: true };
  });

  // Reports
  ipcMain.handle('reports:getData', async (_, { from, to }) => {
    if (!from || !to) throw new Error('Rango de fechas requerido');
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const [allSales, allDetails, allProducts, allReturns] = await Promise.all([
      repo('Sale').find({ order: { created_at: 'ASC' } }),
      repo('SaleDetail').find(),
      repo('Product').find(),
      repo('Return').find(),
    ]);

    const salesInRange = allSales.filter((s) => {
      const d = new Date(s.created_at);
      return d >= fromDate && d <= toDate;
    });
    const saleIds = new Set(salesInRange.map((s) => s.id));
    const details = allDetails.filter((d) => saleIds.has(d.sale_id));

    const productMap = {};
    for (const p of allProducts) productMap[p.id] = p;

    const returnsInRange = allReturns.filter((r) => {
      const d = new Date(r.created_at);
      return d >= fromDate && d <= toDate;
    });
    const totalReturned = returnsInRange.reduce((s, r) => s + Number(r.total_refunded), 0);

    // Summary
    const grossIncome = salesInRange.reduce((s, sale) => s + Number(sale.total), 0);
    const ivaCollected = salesInRange.reduce((s, sale) => s + Number(sale.tax || 0), 0);
    const netIncome = grossIncome - totalReturned;
    const totalProfit = salesInRange.reduce((s, sale) => s + Number(sale.profit || 0), 0);

    // By payment method
    const methodMap = {};
    for (const sale of salesInRange) {
      const m = sale.payment_method || 'Efectivo';
      if (!methodMap[m]) methodMap[m] = { method: m, count: 0, amount: 0 };
      methodMap[m].count++;
      methodMap[m].amount += Number(sale.total);
    }
    const byPaymentMethod = Object.values(methodMap).sort((a, b) => b.amount - a.amount);

    // By category
    const categoryMap = {};
    for (const d of details) {
      const cat = productMap[d.product_id]?.category || 'Sin categoría';
      if (!categoryMap[cat]) categoryMap[cat] = { category: cat, units: 0, income: 0 };
      categoryMap[cat].units += d.quantity;
      categoryMap[cat].income += Number(d.subtotal);
    }
    const byCategory = Object.values(categoryMap).sort((a, b) => b.income - a.income);

    // Top 10 products
    const prodMap = {};
    for (const d of details) {
      if (!prodMap[d.product_id]) {
        prodMap[d.product_id] = { product_id: d.product_id, product_name: d.product_name, units: 0, income: 0, profit: 0 };
      }
      prodMap[d.product_id].units += d.quantity;
      prodMap[d.product_id].income += Number(d.subtotal);
      if (!d.is_regalia) {
        const cost = d.cost_price != null ? Number(d.cost_price) : (productMap[d.product_id]?.cost_price != null ? Number(productMap[d.product_id].cost_price) : null);
        if (cost != null) prodMap[d.product_id].profit += (Number(d.unit_price) - cost) * d.quantity;
      } else if (d.regalia_type === 'propia' && d.cost_price != null) {
        prodMap[d.product_id].profit -= Number(d.cost_price) * d.quantity;
      }
    }
    const topProducts = Object.values(prodMap).sort((a, b) => b.units - a.units).slice(0, 10);

    // Regalía breakdown
    const regaliaPropiaDetails = details.filter((d) => d.regalia_type === 'propia');
    const bonificacionDetails  = details.filter((d) => d.regalia_type === 'bonificacion');
    const regaliaCost          = regaliaPropiaDetails.reduce((s, d) => s + Number(d.cost_price || 0) * d.quantity, 0);
    const regaliaPropiaCount   = regaliaPropiaDetails.reduce((s, d) => s + d.quantity, 0);
    const bonificacionCount    = bonificacionDetails.reduce((s, d) => s + d.quantity, 0);

    // Daily sales
    const dailyMap = {};
    for (const sale of salesInRange) {
      const day = new Date(sale.created_at).toISOString().slice(0, 10);
      if (!dailyMap[day]) dailyMap[day] = { date: day, count: 0, total: 0 };
      dailyMap[day].count++;
      dailyMap[day].total += Number(sale.total);
    }
    const dailySales = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    return {
      summary: { salesCount: salesInRange.length, grossIncome, ivaCollected, netIncome, totalProfit, totalReturned, regaliaCost, regaliaPropiaCount, bonificacionCount },
      byPaymentMethod,
      byCategory,
      topProducts,
      dailySales,
    };
  });

  ipcMain.handle('reports:exportXLSX', async (_, { data, from, to }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Exportar reporte a Excel',
      defaultPath: `reporte-${from}_${to}.xlsx`,
      filters: [{ name: 'Excel', extensions: ['xlsx'] }],
    });
    if (result.canceled || !result.filePath) return { canceled: true };

    const n2 = (v) => Number(Number(v).toFixed(2));
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Summary ──
    const ws1 = XLSX.utils.aoa_to_sheet([
      ['REPORTE DE VENTAS — StarTecnology'],
      [`Período: ${from} — ${to}`],
      [],
      ['Indicador', 'Valor'],
      ['Total ventas', data.summary.salesCount],
      ['Ingreso bruto ($)', n2(data.summary.grossIncome)],
      ['IVA recaudado 13% ($)', n2(data.summary.ivaCollected)],
      ['Devoluciones ($)', n2(data.summary.totalReturned)],
      ['Ingreso neto ($)', n2(data.summary.netIncome)],
      ['Utilidad estimada ($)', n2(data.summary.totalProfit)],
    ]);
    ws1['!cols'] = [{ wch: 28 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');

    // ── Sheet 2: By category ──
    const ws2 = XLSX.utils.aoa_to_sheet([
      ['Categoría', 'Unidades vendidas', 'Ingresos ($)'],
      ...data.byCategory.map((c) => [c.category, c.units, n2(c.income)]),
    ]);
    ws2['!cols'] = [{ wch: 24 }, { wch: 18 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Por Categoría');

    // ── Sheet 3: Top 10 products ──
    const ws3 = XLSX.utils.aoa_to_sheet([
      ['#', 'Producto', 'Unidades vendidas', 'Ingresos ($)', 'Utilidad ($)'],
      ...data.topProducts.map((p, i) => [
        i + 1,
        p.product_name,
        p.units,
        n2(p.income),
        p.profit > 0 ? n2(p.profit) : '',
      ]),
    ]);
    ws3['!cols'] = [{ wch: 4 }, { wch: 36 }, { wch: 18 }, { wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws3, 'Top 10 Productos');

    // ── Sheet 4: Daily sales ──
    const ws4 = XLSX.utils.aoa_to_sheet([
      ['Fecha', 'Número de ventas', 'Total ($)'],
      ...data.dailySales.map((d) => [d.date, d.count, n2(d.total)]),
    ]);
    ws4['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws4, 'Ventas Diarias');

    XLSX.writeFile(wb, result.filePath);
    return { success: true, filePath: result.filePath };
  });

  ipcMain.handle('reports:exportCSV', async (_, { content, filename }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Exportar reporte CSV',
      defaultPath: filename,
      filters: [{ name: 'Archivo CSV', extensions: ['csv'] }],
    });
    if (result.canceled || !result.filePath) return { canceled: true };
    fs.writeFileSync(result.filePath, '\uFEFF' + content, 'utf8'); // BOM for Excel
    return { success: true, filePath: result.filePath };
  });

  ipcMain.handle('backup:manualBackup', async () => {
    const dir = backupsDir();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const today = new Date().toISOString().slice(0, 10);
    // Add timestamp suffix to avoid overwrite
    const timestamp = Date.now();
    const dest = path.join(dir, `backup-${today}-${timestamp}.sqlite`);
    fs.copyFileSync(dbPath(), dest);
    const stat = fs.statSync(dest);
    return { success: true, filePath: dest, size: stat.size };
  });

  // Auth
  ipcMain.handle('auth:login', async (_, { username, password }) => {
    const user = await repo('User').findOneBy({ username });
    if (!user || user.password_hash !== hashPassword(password)) {
      throw new Error('Usuario o contraseña incorrectos.');
    }
    currentSession = { userId: user.id, userName: user.name };
    await logAudit({ action: 'LOGIN', entity: 'user', entityId: user.id, newValue: { username: user.username, role: user.role } });
    return { id: user.id, name: user.name, username: user.username, role: user.role };
  });

  ipcMain.handle('auth:logout', async () => {
    if (currentSession) {
      await logAudit({ action: 'LOGOUT', entity: 'user', entityId: currentSession.userId, newValue: { userName: currentSession.userName } });
    }
    currentSession = null;
    return { success: true };
  });

  // Users
  ipcMain.handle('users:getAll', async () => {
    const users = await repo('User').find({ order: { name: 'ASC' } });
    return users.map(({ password_hash, ...u }) => u);
  });

  ipcMain.handle('users:create', async (_, data) => {
    const dup = await repo('User').findOneBy({ username: data.username });
    if (dup) throw new Error('El nombre de usuario ya existe.');
    const user = repo('User').create({
      name: data.name,
      username: data.username,
      password_hash: hashPassword(data.password),
      role: data.role,
    });
    const saved = await repo('User').save(user);
    await logAudit({ action: 'CREATE', entity: 'user', entityId: saved.id, newValue: { name: saved.name, username: saved.username, role: saved.role } });
    const { password_hash, ...result } = saved;
    return result;
  });

  ipcMain.handle('users:update', async (_, { id, ...data }) => {
    if (data.username) {
      const dup = await repo('User').findOneBy({ username: data.username });
      if (dup && dup.id !== id) throw new Error('El nombre de usuario ya existe.');
    }
    const oldUser = await repo('User').findOneBy({ id });
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.username) updateData.username = data.username;
    if (data.role) updateData.role = data.role;
    if (data.password) updateData.password_hash = hashPassword(data.password);
    await repo('User').update(id, updateData);
    const updated = await repo('User').findOneBy({ id });
    await logAudit({
      action: 'UPDATE', entity: 'user', entityId: id,
      oldValue: oldUser ? { name: oldUser.name, username: oldUser.username, role: oldUser.role } : null,
      newValue: updated ? { name: updated.name, username: updated.username, role: updated.role, password_changed: !!data.password } : null,
    });
    const { password_hash, ...result } = updated;
    return result;
  });

  ipcMain.handle('users:delete', async (_, id) => {
    const user = await repo('User').findOneBy({ id });
    if (user?.role === 'Admin') {
      const adminCount = await repo('User').count({ where: { role: 'Admin' } });
      if (adminCount <= 1) throw new Error('No se puede eliminar el último administrador.');
    }
    await repo('User').delete(id);
    await logAudit({ action: 'DELETE', entity: 'user', entityId: id, oldValue: user ? { name: user.name, username: user.username, role: user.role } : null });
    return { success: true };
  });

  // Audit Log
  ipcMain.handle('auditLog:getAll', async (_, filters = {}) => {
    const { page = 1, pageSize = 50, userId, action, entity, dateFrom, dateTo } = filters;
    const qb = repo('AuditLog')
      .createQueryBuilder('a')
      .orderBy('a.timestamp', 'DESC');
    if (userId)   qb.andWhere('a.user_id = :userId', { userId: Number(userId) });
    if (action)   qb.andWhere('a.action = :action',   { action });
    if (entity)   qb.andWhere('a.entity = :entity',   { entity });
    if (dateFrom) {
      const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
      qb.andWhere('a.timestamp >= :dateFrom', { dateFrom: from.toISOString() });
    }
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
      qb.andWhere('a.timestamp <= :dateTo', { dateTo: to.toISOString() });
    }
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return { items, total, page, pageSize };
  });
}

// ── Window ─────────────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  return mainWindow;
}

app.whenReady().then(async () => {
  await initDatabase();
  await seedDefaultAdmin();
  await runAutoBackup();
  setupIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
