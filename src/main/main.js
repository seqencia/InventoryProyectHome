const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { DataSource, EntitySchema } = require('typeorm');

// ── Schemas ────────────────────────────────────────────────────────────────

const ProductSchema = new EntitySchema({
  name: 'Product',
  tableName: 'products',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
    description: { type: String, nullable: true, default: '' },
    category: { type: String, nullable: true },
    price: { type: 'decimal', precision: 10, scale: 2 },
    stock: { type: Number },
    created_at: { type: 'datetime', createDate: true },
    updated_at: { type: 'datetime', updateDate: true },
  },
});

const SaleSchema = new EntitySchema({
  name: 'Sale',
  tableName: 'sales',
  columns: {
    id: { type: Number, primary: true, generated: true },
    total: { type: 'decimal', precision: 10, scale: 2 },
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
    entities: [ProductSchema, SaleSchema, SaleDetailSchema],
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

  // Sales
  ipcMain.handle('sales:create', async (_, { items }) => {
    return await AppDataSource.transaction(async (manager) => {
      const total = items.reduce((sum, item) => sum + item.subtotal, 0);

      const savedSale = await manager.save(
        'Sale',
        manager.create('Sale', { total })
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
