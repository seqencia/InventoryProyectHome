const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { DataSource, EntitySchema, In } = require('typeorm');

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
    customer_id: { type: Number, nullable: true },
    customer_name: { type: String, nullable: true },
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
  },
});

// ── Database ───────────────────────────────────────────────────────────────

let AppDataSource;

async function initDatabase() {
  AppDataSource = new DataSource({
    type: 'sqlite',
    database: path.join(app.getPath('userData'), 'database.sqlite'),
    entities: [ProductSchema, CategorySchema, CustomerSchema, SaleSchema, SaleDetailSchema],
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
    const [allSales, allDetails, allProducts] = await Promise.all([
      repo('Sale').find({ order: { created_at: 'DESC' } }),
      repo('SaleDetail').find(),
      repo('Product').find(),
    ]);

    // Today's sales (local midnight)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySales = allSales.filter((s) => new Date(s.created_at) >= todayStart);
    const todayTotal = todaySales.reduce((sum, s) => sum + Number(s.total), 0);
    const todayCount = todaySales.length;
    const todayProfit = todaySales.reduce((sum, s) => sum + Number(s.profit || 0), 0);

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

    return { todayTotal, todayCount, todayProfit, lowStock, topProducts, recentSales };
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

  // Sales
  ipcMain.handle('sales:create', async (_, { items, customerId, customerName, paymentMethod, status }) => {
    return await AppDataSource.transaction(async (manager) => {
      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const tax = subtotal * 0.13;
      const total = subtotal + tax;

      // Profit = sum of (unit_price - cost_price) * quantity per item
      const productIds = items.map((i) => i.product_id);
      const products = await manager.getRepository('Product').find({ where: { id: In(productIds) } });
      const productMap = {};
      for (const p of products) productMap[p.id] = p;

      let profit = 0;
      for (const item of items) {
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
            unit_price: item.unit_price,
            subtotal: item.subtotal,
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
}

// ── Window ─────────────────────────────────────────────────────────────────

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(async () => {
  await initDatabase();
  setupIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
