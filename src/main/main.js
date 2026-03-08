const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const { DataSource, EntitySchema, In } = require('typeorm');

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
    regalia_count: { type: Number, nullable: true, default: 0 },
    customer_id: { type: Number, nullable: true },
    customer_name: { type: String, nullable: true },
    created_at: { type: 'datetime', createDate: true },
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
    product_id: { type: Number },
    product_name: { type: String },
    quantity: { type: Number },
    bonus_quantity: { type: Number, nullable: true, default: 0 },
    unit_cost: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    supplier_id: { type: Number, nullable: true },
    supplier_name: { type: String, nullable: true },
    notes: { type: String, nullable: true },
    created_at: { type: 'datetime', createDate: true },
  },
});

const SaleDetailSchema = new EntitySchema({
  name: 'SaleDetail',
  tableName: 'sale_details',
  columns: {
    id: { type: Number, primary: true, generated: true },
    sale_id: { type: Number },
    product_id: { type: Number },
    product_name: { type: String },
    quantity: { type: Number },
    unit_price: { type: 'decimal', precision: 10, scale: 2 },
    subtotal: { type: 'decimal', precision: 10, scale: 2 },
    is_regalia: { type: Boolean, nullable: true, default: false },
  },
});

const ReturnSchema = new EntitySchema({
  name: 'Return',
  tableName: 'returns',
  columns: {
    id: { type: Number, primary: true, generated: true },
    sale_id: { type: Number },
    reason: { type: String },
    notes: { type: String, nullable: true },
    total_refunded: { type: 'decimal', precision: 10, scale: 2 },
    is_partial: { type: Boolean, default: false },
    created_at: { type: 'datetime', createDate: true },
  },
});

const ReturnDetailSchema = new EntitySchema({
  name: 'ReturnDetail',
  tableName: 'return_details',
  columns: {
    id: { type: Number, primary: true, generated: true },
    return_id: { type: Number },
    product_id: { type: Number },
    product_name: { type: String },
    quantity: { type: Number },
    unit_price: { type: 'decimal', precision: 10, scale: 2 },
    subtotal: { type: 'decimal', precision: 10, scale: 2 },
  },
});

// ── Database ───────────────────────────────────────────────────────────────

let AppDataSource;

async function initDatabase() {
  AppDataSource = new DataSource({
    type: 'sqlite',
    database: path.join(app.getPath('userData'), 'database.sqlite'),
    entities: [ProductSchema, CategorySchema, CustomerSchema, SaleSchema, SaleDetailSchema, SupplierSchema, StockEntrySchema, ReturnSchema, ReturnDetailSchema],
    synchronize: true,
    logging: false,
  });
  await AppDataSource.initialize();
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
    return await repo('Product').save(repo('Product').create(data));
  });

  ipcMain.handle('products:update', async (_, { id, ...data }) => {
    await repo('Product').update(id, data);
    return await repo('Product').findOneBy({ id });
  });

  ipcMain.handle('products:delete', async (_, id) => {
    await repo('Product').delete(id);
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

    return { todayTotal, todayCount, todayProfit, todayReturnCount, todayReturnTotal, lowStock, topProducts, recentSales };
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
    return await AppDataSource.transaction(async (manager) => {
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
  });

  // Sales
  ipcMain.handle('sales:create', async (_, { items, customerId, customerName, paymentMethod, status }) => {
    return await AppDataSource.transaction(async (manager) => {
      const regularItems = items.filter((i) => !i.is_regalia);
      const regaliaItems = items.filter((i) => i.is_regalia);

      const subtotal = regularItems.reduce((sum, item) => sum + item.subtotal, 0);
      const tax = subtotal * 0.13;
      const total = subtotal + tax;
      const regaliaCount = regaliaItems.reduce((sum, item) => sum + item.quantity, 0);

      // Profit: only from regular (non-regalía) items
      const productIds = items.map((i) => i.product_id);
      const products = await manager.getRepository('Product').find({ where: { id: In(productIds) } });
      const productMap = {};
      for (const p of products) productMap[p.id] = p;

      let profit = 0;
      for (const item of regularItems) {
        const product = productMap[item.product_id];
        if (product && product.cost_price != null) {
          profit += (item.unit_price - Number(product.cost_price)) * item.quantity;
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
          regalia_count: regaliaCount,
          customer_id: customerId || null,
          customer_name: customerName || null,
        })
      );

      for (const item of items) {
        await manager.save(
          'SaleDetail',
          manager.create('SaleDetail', {
            sale_id: savedSale.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.is_regalia ? 0 : item.unit_price,
            subtotal: item.is_regalia ? 0 : item.subtotal,
            is_regalia: item.is_regalia || false,
          })
        );
        await manager
          .getRepository('Product')
          .decrement({ id: item.product_id }, 'stock', item.quantity);
      }

      return savedSale;
    });
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
    return await AppDataSource.transaction(async (manager) => {
      // Get original sale details to determine if partial
      const originalDetails = await manager.getRepository('SaleDetail').find({ where: { sale_id: saleId } });

      const totalRefunded = items.reduce((sum, item) => sum + item.subtotal, 0);

      // Determine partial: if any original line item is not fully returned
      const returnedMap = {};
      for (const item of items) returnedMap[item.product_id] = (returnedMap[item.product_id] || 0) + item.quantity;
      const isPartial = originalDetails.some((d) => (returnedMap[d.product_id] || 0) < d.quantity);

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
      const p = productMap[d.product_id];
      if (p?.cost_price != null) {
        prodMap[d.product_id].profit += (Number(d.unit_price) - Number(p.cost_price)) * d.quantity;
      }
    }
    const topProducts = Object.values(prodMap).sort((a, b) => b.units - a.units).slice(0, 10);

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
      summary: { salesCount: salesInRange.length, grossIncome, ivaCollected, netIncome, totalProfit, totalReturned },
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
