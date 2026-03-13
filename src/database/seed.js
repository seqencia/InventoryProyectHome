'use strict';

/**
 * StarTecnology — Database Seed Script
 * Usage:  node src/database/seed.js [/path/to/database.sqlite]
 * Default DB path: %APPDATA%\inventario-venta-desktop\database.sqlite
 *
 * Uses the same TypeORM DataSource (schemas + config) as main.js via the
 * shared src/database/dataSource.js module — no duplicated schema definitions.
 */

const path = require('path');
const { createDataSource } = require('./dataSource');

// ─── DB path ─────────────────────────────────────────────────────────────────
// Mirrors the path Electron resolves with app.getPath('userData') on Windows.
const DB_PATH = process.argv[2] ||
  path.join(
    process.env.APPDATA || process.env.HOME || '.',
    'inventario-venta-desktop',
    'database.sqlite'
  );

console.log('\n📦  StarTecnology — Seed Script');
console.log(`📁  Base de datos: ${DB_PATH}\n`);

// ─── DataSource (shared with main.js via src/database/dataSource.js) ─────────

const AppDataSource = createDataSource(DB_PATH);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const r2  = v => Math.round(parseFloat(v || 0) * 100) / 100;
const r6  = v => parseFloat(parseFloat(v || 0).toFixed(6));
const rnd = (min, max) => Math.random() * (max - min) + min;
const ri  = (min, max) => Math.floor(rnd(min, max + 1));
const pick = arr => arr[ri(0, arr.length - 1)];

function pickW(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r <= 0) return items[i]; }
  return items[items.length - 1];
}

function computePricing(costo, sinIva) {
  const s = parseFloat(sinIva) || 0;
  const c = parseFloat(costo)  || 0;
  return {
    precio_venta_con_iva: r6(s * 1.13),
    precio_neto:          r6(s),
    utilidad:             r6(s - c),
  };
}

// ─── Date generation ──────────────────────────────────────────────────────────

const START  = new Date('2025-09-12T00:00:00');
const END    = new Date('2026-03-11T23:59:59');
const TOTAL_MS = END - START;

// month index → weight
const MON_W = { 8: 0.9, 9: 1.0, 10: 1.0, 11: 1.3, 0: 0.8, 1: 1.0, 2: 1.0 };
// Sun=0 Mon=1 … Sat=6
const DOW_W = [0.5, 1.4, 1.4, 1.4, 1.4, 1.4, 0.8];
const MAX_W = 1.3 * 1.4;
// Hours 0–23
const HOUR_W = [
  0.02, 0.01, 0.01, 0.01, 0.01, 0.02,   // 0–5   (closed)
  0.10, 0.35, 1.40, 3.00, 3.00, 2.50,   // 6–11  (morning peak 9–11)
  1.80, 1.80, 2.50, 3.00, 3.00, 2.00,   // 12–17 (afternoon peak 14–16)
  1.00, 0.50, 0.20, 0.08, 0.03, 0.01,   // 18–23 (closing)
];
const HOUR_TOT = HOUR_W.reduce((a, b) => a + b, 0);

function randHour() {
  let r = Math.random() * HOUR_TOT;
  for (let i = 0; i < HOUR_W.length; i++) { r -= HOUR_W[i]; if (r <= 0) return i; }
  return 15;
}

function randDate() {
  while (true) {
    const d = new Date(START.getTime() + Math.random() * TOTAL_MS);
    const w = (MON_W[d.getMonth()] ?? 1) * DOW_W[d.getDay()];
    if (Math.random() < w / MAX_W) {
      d.setHours(randHour(), ri(0, 59), ri(0, 59), 0);
      return d;
    }
  }
}

function isoDate(d) { return d.toISOString().replace('T', ' ').slice(0, 19); }

// ─── Seed data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Laptops y Computadoras', description: 'Laptops, notebooks y computadoras de escritorio' },
  { name: 'Smartphones y Tablets',  description: 'Teléfonos inteligentes y tabletas' },
  { name: 'Accesorios',             description: 'Accesorios para dispositivos móviles y computadoras' },
  { name: 'Componentes de PC',      description: 'Piezas y componentes para ensamble y reparación' },
  { name: 'Periféricos',            description: 'Monitores, teclados, mouse e impresoras' },
  { name: 'Audio y Video',          description: 'Bocinas, audífonos, cámaras y TV Boxes' },
  { name: 'Cargadores y Cables',    description: 'Cargadores, cables y accesorios de energía' },
  { name: 'Almacenamiento',         description: 'Memorias USB, tarjetas SD y discos externos' },
];

const SUPPLIERS = [
  { name: 'TechSalva Distribuciones',    phone: '2222-1100', email: 'ventas@techsalva.com.sv',   address: 'Blvd. Los Héroes Local 4, San Salvador',        notes: 'Distribuidor oficial Samsung y Lenovo' },
  { name: 'ComputecSV',                  phone: '2447-5500', email: 'info@computecsv.com',         address: '4a Av. Norte #12, Santa Ana',                    notes: 'Especialista en componentes y periféricos' },
  { name: 'Digi El Salvador',            phone: '2660-8800', email: 'digi@digitalsv.com',          address: 'Calle Siemens #8, San Miguel',                   notes: 'Smartphones y tablets nuevas, importaciones USA' },
  { name: 'AlmacenTech',                 phone: '2224-3300', email: 'almacen@almacentech.sv',      address: 'Metrocentro Local 45, San Salvador',             notes: 'Accesorios y cables al por mayor' },
  { name: 'InfoSalva',                   phone: '2451-7700', email: 'compras@infosalva.net',        address: 'Blvd. M. E. Araujo, Sonsonate',                 notes: 'Computadoras y laptops reacondicionadas' },
  { name: 'EquiposSV',                   phone: '2338-6600', email: 'equipos@equipossv.com.sv',    address: 'Plaza Merliot Local 12, La Libertad',            notes: 'Equipos Apple y accesorios originales' },
  { name: 'TechCenter SA de CV',         phone: '2511-4400', email: 'tc@techcenter.sv',            address: 'Col. Escalón Av. 99 #15, San Salvador',          notes: 'Proveedor de monitores y periféricos' },
  { name: 'DigitalesHN Importaciones',   phone: '2223-9900', email: 'import@digitalessv.com',      address: 'Zona Franca San Marcos Bodega 7',                notes: 'Importaciones directas desde Asia y EE.UU.' },
  { name: 'MegaTech SV',                 phone: '2633-2200', email: 'mega@megasv.com.sv',          address: 'Av. Las Palmas #34, Usulután',                   notes: 'Audio, video y almacenamiento al por mayor' },
  { name: 'CentralTech',                 phone: '2313-8800', email: 'ventas@centraltech.sv',       address: 'Parque Central Local 3, Cojutepeque',            notes: 'Distribuidor zona central del país' },
];

// [name, category, condition, costo, sinIva, stock, minStock, description]
const PRODUCTS = [
  // ── Laptops y Computadoras ──────────────────────────────────────────────────
  ['Dell Inspiron 15 3000',          'Laptops y Computadoras', 'Bueno',   175, 249,  6, 2, 'Intel Core i5-10th, 8GB RAM, 256GB SSD, Win 11 Home'],
  ['HP Pavilion 14',                 'Laptops y Computadoras', 'Nuevo',   320, 449,  4, 2, 'AMD Ryzen 5 5500U, 8GB RAM, 512GB SSD, pantalla FHD'],
  ['Lenovo IdeaPad 3',               'Laptops y Computadoras', 'Regular', 115, 163,  3, 1, 'Intel Core i3-10110U, 4GB RAM, 1TB HDD, detalle en teclado'],
  ['Acer Aspire 5',                  'Laptops y Computadoras', 'Bueno',   200, 284,  5, 2, 'Intel Core i5-8265U, 8GB RAM, 256GB SSD, batería nueva'],
  ['HP 14" AMD A4',                  'Laptops y Computadoras', 'Bueno',   148, 210,  7, 3, 'AMD A4-9125, 4GB RAM, 128GB eMMC, liviana y portátil'],
  ['Dell Latitude E5470',            'Laptops y Computadoras', 'Regular', 108, 153,  4, 1, 'Intel Core i5-6300U, 8GB RAM, 256GB SSD, empresarial'],
  ['Chromebook HP 11"',              'Laptops y Computadoras', 'Nuevo',   178, 249,  5, 2, 'MediaTek MT8183, 4GB RAM, 64GB eMMC, Chrome OS'],
  ['ASUS VivoBook 15',               'Laptops y Computadoras', 'Bueno',   220, 314,  4, 2, 'Intel Core i5-1135G7, 8GB RAM, 512GB SSD, pantalla FHD'],
  ['Toshiba Satellite C55',          'Laptops y Computadoras', 'Regular',  78, 112,  3, 1, 'Intel Core i3-5005U, 4GB RAM, 500GB HDD, batería reemplazada'],
  ['MacBook Air 13" M1',             'Laptops y Computadoras', 'Bueno',   650, 919,  2, 1, 'Apple M1, 8GB RAM, 256GB SSD, excelentes condiciones'],
  // ── Smartphones y Tablets ──────────────────────────────────────────────────
  ['Samsung Galaxy A32',             'Smartphones y Tablets',  'Bueno',   118, 168,  8, 3, '6.4" AMOLED 90Hz, 64GB, batería 5000mAh, desbloqueado'],
  ['iPhone 11 64GB',                 'Smartphones y Tablets',  'Bueno',   275, 389,  5, 2, '6.1" LCD, iOS 17, pantalla perfecta, caja incluida'],
  ['Motorola Moto G31',              'Smartphones y Tablets',  'Nuevo',   108, 154, 10, 4, '6.4" AMOLED, 128GB/4GB RAM, cámara 50MP, Android 12'],
  ['Samsung Galaxy S21 5G',          'Smartphones y Tablets',  'Bueno',   375, 529,  3, 1, '6.2" Dynamic AMOLED, 128GB, 5G, cargador incluido'],
  ['Xiaomi Redmi Note 11',           'Smartphones y Tablets',  'Nuevo',   128, 182, 12, 4, '6.43" AMOLED 90Hz, 128GB/4GB RAM, batería 5000mAh'],
  ['iPad 9a Generación 64GB',        'Smartphones y Tablets',  'Bueno',   218, 309,  4, 2, '10.2" Retina, chip A13 Bionic, WiFi, cargador original'],
  ['Samsung Galaxy Tab A7',          'Smartphones y Tablets',  'Bueno',   148, 212,  5, 2, '10.4" TFT, 32GB, Android 12, Snapdragon 662'],
  ['LG K22 32GB',                    'Smartphones y Tablets',  'Regular',  55,  79,  6, 2, '6.2", Android 10, dual SIM, batería 4000mAh nueva'],
  ['Alcatel 3L 2021',                'Smartphones y Tablets',  'Nuevo',    72, 103,  8, 3, '6.22" HD+, 64GB/4GB RAM, triple cámara, Android 11'],
  ['iPhone 12 128GB',                'Smartphones y Tablets',  'Bueno',   348, 495,  4, 2, '6.1" OLED Super Retina, 5G, batería 100%, accesorios originales'],
  // ── Accesorios ─────────────────────────────────────────────────────────────
  ['Funda protectora universal',     'Accesorios', 'Nuevo', 2.5,  6.5, 30, 10, 'Compatible con la mayoría de smartphones, silicón premium'],
  ['Vidrio templado protector',      'Accesorios', 'Nuevo', 1.8,  5.0, 40, 15, 'Protector de pantalla 9H, borde curvo, antihuellas'],
  ['Case Samsung Galaxy A32',        'Accesorios', 'Nuevo', 3.5,  9.0, 20,  8, 'Funda rígida con diseño, colores surtidos'],
  ['Audífonos Bluetooth JBL',        'Accesorios', 'Bueno', 24,  37,   8,  3, 'Over-ear BT 5.0, cancelación de ruido, autonomía 30h'],
  ['Mouse inalámbrico Logitech M185','Accesorios', 'Nuevo', 17,  25,  15,  5, 'Receptor USB nano, pila incluida, 1 año de garantía'],
  ['Teclado USB básico',             'Accesorios', 'Nuevo', 11,  16,  20,  6, 'Membrana, diseño compacto, compatible Windows/Linux/Mac'],
  ['Webcam HD 1080p',                'Accesorios', 'Nuevo', 19,  28,  10,  4, 'Full HD 30fps, micrófono incorporado, plug & play'],
  ['Hub USB 4 puertos 3.0',          'Accesorios', 'Nuevo',  7,  12,  18,  6, 'USB 3.0, cable 30cm, velocidad 5Gbps, compatible Mac/Win'],
  // ── Componentes de PC ──────────────────────────────────────────────────────
  ['RAM DDR4 8GB 2666MHz',           'Componentes de PC', 'Nuevo',  28, 42, 12, 4, 'Kingston ValueRAM SO-DIMM, para laptops y mini-PCs'],
  ['SSD 256GB SATA III',             'Componentes de PC', 'Nuevo',  38, 56, 10, 4, 'Kingston A400, 500MB/s lectura, factor de forma 2.5"'],
  ['Disco Duro 1TB 7200RPM',         'Componentes de PC', 'Nuevo',  43, 63,  8, 3, 'Seagate Barracuda, 3.5", SATA III, caché 256MB'],
  ['Procesador Intel Core i5-8400',  'Componentes de PC', 'Bueno',  78,112,  5, 2, '6 núcleos 2.8GHz, socket LGA1151, sin disipador'],
  ['Tarjeta de Video GT 1030 2GB',   'Componentes de PC', 'Bueno',  88,125,  4, 2, 'NVIDIA GeForce GT 1030 GDDR5, HDMI + DVI'],
  ['Placa Madre H310M-A',            'Componentes de PC', 'Bueno',  58, 83,  5, 2, 'ASUS PRIME H310M-A, socket 1151, DDR4, Micro-ATX'],
  // ── Periféricos ────────────────────────────────────────────────────────────
  ['Monitor LED 19" HP V19',         'Periféricos', 'Bueno',  78,112,  6, 2, 'Resolución 1366×768, VGA, tiempo de respuesta 5ms'],
  ['Monitor LED 21.5" Acer R221Q',   'Periféricos', 'Bueno', 108,154,  5, 2, 'Full HD 1080p IPS, HDMI + VGA, diseño sin marco'],
  ['Impresora HP DeskJet 2775',      'Periféricos', 'Bueno',  43, 62,  4, 2, 'Inyección de tinta, WiFi, scanner, copia, pantalla LED'],
  ['Combo Teclado + Mouse USB',      'Periféricos', 'Nuevo',  14, 21, 20, 6, 'Membrana, óptico 1000DPI, cable 1.5m, color negro'],
  ['Headset Gamer HyperX Cloud',     'Periféricos', 'Bueno',  42, 60,  5, 2, 'Sonido 7.1, micrófono desmontable, USB, almohadillas foam'],
  // ── Audio y Video ──────────────────────────────────────────────────────────
  ['Bocina Bluetooth portátil',      'Audio y Video', 'Nuevo', 17, 26, 12, 4, 'IPX5, 10W, BT 5.0, batería 8h, colores surtidos'],
  ['Bocina JBL Charge 4',            'Audio y Video', 'Bueno', 58, 83,  5, 2, 'IPX7, 20h de batería, power bank integrado'],
  ['Cámara IP seguridad 1080p',      'Audio y Video', 'Nuevo', 24, 36,  8, 3, 'WiFi, visión nocturna 10m, detección de movimiento, app'],
  ['TV Box Android 4K',              'Audio y Video', 'Nuevo', 21, 32, 10, 4, 'Android 10, 4K HDR, WiFi dual band, BT 5.0, 16GB'],
  // ── Cargadores y Cables ────────────────────────────────────────────────────
  ['Cargador USB-C 20W',             'Cargadores y Cables', 'Nuevo',  7.5, 13, 25, 8, 'Carga rápida PD 3.0, compatible iPhone 12/13/14 y Android'],
  ['Cable USB-C a USB-C 1m',         'Cargadores y Cables', 'Nuevo',  2.8,  6, 30,10, 'Nylon trenzado, 100W 5A, carga y datos 480Mbps'],
  ['Cargador Inalámbrico 15W',       'Cargadores y Cables', 'Nuevo',  9.5, 16, 15, 5, 'Qi, compatible Samsung/iPhone/Xiaomi, indicador LED'],
  ['Power Bank 10000mAh',            'Cargadores y Cables', 'Nuevo', 11.5, 19, 12, 4, 'Carga rápida 22.5W, USB-A x2 + USB-C, pantalla LED'],
  // ── Almacenamiento ─────────────────────────────────────────────────────────
  ['Memoria USB 64GB 3.0',           'Almacenamiento', 'Nuevo',  7.5, 13, 20, 8, 'Kingston DataTraveler 100MB/s, carcasa metálica'],
  ['Tarjeta microSD 128GB',          'Almacenamiento', 'Nuevo', 11.5, 18, 18, 6, 'Samsung EVO Select U3 A2 V30, 130MB/s, con adaptador SD'],
  ['Disco Externo USB 500GB',        'Almacenamiento', 'Bueno', 33,   49,  7, 3, 'Seagate Backup Plus Slim USB 3.0, autoalimentado'],
];

// ─── Customer name data ───────────────────────────────────────────────────────

const MALE   = ['Carlos','José','Miguel','Juan','Luis','Roberto','Eduardo','Oscar','Rodrigo','Fernando','Diego','Mario','Ricardo','Alberto','Andrés'];
const FEMALE = ['María','Ana','Laura','Sandra','Patricia','Rosa','Claudia','Daniela','Valeria','Carmen','Isabel','Sofía','Elena','Gabriela','Alejandra'];
const LAST   = ['García','Martínez','López','Hernández','Ramírez','Torres','Flores','Castro','Mejía','Cruz','Molina','Rivas','Gutiérrez','Peña','Aguilar','Vásquez','Sánchez','Rodríguez','Jiménez','Morales'];

function makeCustomers(n) {
  const all = [...MALE, ...FEMALE];
  return Array.from({ length: n }, (_, i) => {
    const fn  = all[i % all.length];
    const ln1 = LAST[ri(0, LAST.length - 1)];
    const ln2 = LAST[ri(0, LAST.length - 1)];
    const dig = `${ri(7000_0000, 7999_9999)}`;
    return {
      name:  `${fn} ${ln1} ${ln2}`,
      phone: `${dig.slice(0, 4)}-${dig.slice(4)}`,
      email: `${fn.toLowerCase()}.${ln1.toLowerCase()}${ri(10, 99)}@gmail.com`,
    };
  });
}

// ─── Sale generation constants ────────────────────────────────────────────────

const PAY_METHODS = ['Efectivo','Efectivo','Efectivo','Efectivo','Efectivo','Efectivo','Efectivo','Tarjeta','Tarjeta','Transferencia'];
const STATUSES    = Array(90).fill('Completada').concat(Array(7).fill('Pendiente')).concat(Array(3).fill('Cancelada'));
const RETURN_REASONS = [
  'Producto defectuoso','No funciona correctamente','Cliente cambió de opinión',
  'Producto incorrecto entregado','Daño en el empaque','No cumplió expectativas',
];
const ENTRY_NOTES = ['Reposición mensual','Compra directa proveedor','Importación lote nuevo','Liquidación stock','Compra de emergencia','Oferta proveedor',null,null,null];

// ─── Bulk insert helper (bypasses createDate hook → allows custom dates) ──────

async function bulkInsert(table, rows, chunkSize = 100) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await AppDataSource.createQueryBuilder().insert().into(table).values(chunk).execute();
  }
}

// ─── Main seed function ───────────────────────────────────────────────────────

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ Base de datos conectada\n');

  const repo = n => AppDataSource.getRepository(n);

  // ── 1. Categories ────────────────────────────────────────────────────────
  let cats;
  if (await repo('Category').count() > 0) {
    cats = await repo('Category').find();
    console.log(`⏭  Categorías: ${cats.length} existentes, omitiendo`);
  } else {
    cats = [];
    for (const d of CATEGORIES) cats.push(await repo('Category').save(repo('Category').create(d)));
    console.log(`✅ Categorías: ${cats.length} creadas`);
  }
  const catByName = Object.fromEntries(cats.map(c => [c.name, c.id]));

  // ── 2. Suppliers ─────────────────────────────────────────────────────────
  let suppliers;
  if (await repo('Supplier').count() > 0) {
    suppliers = await repo('Supplier').find();
    console.log(`⏭  Proveedores: ${suppliers.length} existentes, omitiendo`);
  } else {
    suppliers = [];
    for (const d of SUPPLIERS) suppliers.push(await repo('Supplier').save(repo('Supplier').create(d)));
    console.log(`✅ Proveedores: ${suppliers.length} creados`);
  }

  // ── 3. Products ──────────────────────────────────────────────────────────
  let products;
  if (await repo('Product').count() > 0) {
    products = await repo('Product').find();
    console.log(`⏭  Productos: ${products.length} existentes, omitiendo`);
  } else {
    products = [];
    for (let i = 0; i < PRODUCTS.length; i++) {
      const [name, cat, cond, costo, sinIva, stock, minStock, desc] = PRODUCTS[i];
      const pricing = computePricing(costo, sinIva);
      const prod = await repo('Product').save(repo('Product').create({
        sku: `PRD-${String(i + 1).padStart(3, '0')}`,
        barcode: `7720000${String(i + 1).padStart(6, '0')}`,
        name, description: desc,
        category: cat, condition: cond,
        status: 'Disponible',
        disponible_regalia: Math.random() < 0.25,
        precio_costo:         r6(costo),
        precio_venta_sin_iva: r6(sinIva),
        sale_price:           r6(sinIva),
        cost_price:           r6(costo),
        ...pricing,
        stock: 0,   // will be recalculated after entries/sales
        min_stock: minStock,
      }));
      products.push(prod);
    }
    console.log(`✅ Productos: ${products.length} creados`);
  }

  // stock tracker (in-memory)
  const stockMap = Object.fromEntries(products.map(p => [p.id, 0]));

  // ── 4. Customers ─────────────────────────────────────────────────────────
  let customers;
  if (await repo('Customer').count() > 0) {
    customers = await repo('Customer').find();
    console.log(`⏭  Clientes: ${customers.length} existentes, omitiendo`);
  } else {
    customers = [];
    for (const d of makeCustomers(30))
      customers.push(await repo('Customer').save(repo('Customer').create(d)));
    console.log(`✅ Clientes: ${customers.length} creados`);
  }

  // ── 5. Stock Entries ─────────────────────────────────────────────────────
  if (await repo('StockEntry').count() > 0) {
    // Rebuild stockMap from existing entries
    const existing = await repo('StockEntry').find();
    for (const e of existing) {
      if (stockMap[e.product_id] !== undefined)
        stockMap[e.product_id] += (e.quantity || 0) + (e.bonus_quantity || 0);
    }
    // Also subtract existing sales
    const existingSales = await repo('SaleDetail').find();
    for (const d of existingSales) {
      if (stockMap[d.product_id] !== undefined)
        stockMap[d.product_id] = Math.max(0, stockMap[d.product_id] - d.quantity);
    }
    console.log(`⏭  Entradas de stock: ${existing.length} existentes, omitiendo`);
  } else {
    // Cheap/high-volume products get higher qty per entry
    const highVol = new Set([
      'Funda protectora universal','Vidrio templado protector','Case Samsung Galaxy A32',
      'Mouse inalámbrico Logitech M185','Teclado USB básico','Hub USB 4 puertos 3.0',
      'Combo Teclado + Mouse USB','Cargador USB-C 20W','Cable USB-C a USB-C 1m',
      'Memoria USB 64GB 3.0','Tarjeta microSD 128GB',
    ]);

    const entryRows = [];
    for (let i = 0; i < 300; i++) {
      const prod     = pick(products);
      const supplier = pick(suppliers);
      const isHV     = highVol.has(prod.name);
      const qty      = isHV ? ri(10, 30) : ri(2, 8);
      const hasBonus = Math.random() < 0.15;
      const bonus    = hasBonus ? ri(1, Math.max(1, Math.floor(qty * 0.2))) : 0;
      const date     = randDate();

      stockMap[prod.id] += qty + bonus;

      entryRows.push({
        product_id:   prod.id,
        product_name: prod.name,
        quantity:     qty,
        bonus_quantity: bonus,
        unit_cost:    r2(parseFloat(prod.precio_costo) * rnd(0.88, 1.12)),
        supplier_id:  supplier.id,
        supplier_name: supplier.name,
        notes:        pick(ENTRY_NOTES),
        precio_venta_bonificacion:    hasBonus ? r6(parseFloat(prod.precio_venta_sin_iva) * rnd(0.80, 0.90)) : null,
        precio_bonificacion_pendiente: hasBonus ? (Math.random() < 0.35) : false,
        created_at:   isoDate(date),
      });
    }

    await bulkInsert('stock_entries', entryRows);
    console.log(`✅ Entradas de stock: 300 creadas`);
  }

  // ── 6. Sales ─────────────────────────────────────────────────────────────
  const completedSalesForReturns = []; // {saleId, date, details:[{product_id,product_name,qty,unit_price}]}

  if (await repo('Sale').count() > 0) {
    console.log(`⏭  Ventas: ${await repo('Sale').count()} existentes, omitiendo`);
  } else {
    // Pre-generate & sort all 1500 sale dates
    const saleDates = Array.from({ length: 1500 }, () => randDate()).sort((a, b) => a - b);

    const saleRows   = [];
    const detailRows = [];

    for (const saleDate of saleDates) {
      // Pick 1–4 products that have stock
      const available = products.filter(p => stockMap[p.id] >= 1);
      if (available.length === 0) continue;

      const nItems  = Math.min(ri(1, 4), available.length);
      const chosen  = [];
      const pool    = [...available];
      for (let k = 0; k < nItems; k++) {
        const idx = ri(0, pool.length - 1);
        chosen.push(pool.splice(idx, 1)[0]);
      }

      // Sale metadata
      const status      = pick(STATUSES);
      const payMethod   = pick(PAY_METHODS);
      const anonymous   = Math.random() < 0.30;
      const customer    = anonymous ? null : pick(customers);
      const hasDiscount = Math.random() < 0.10;
      const hasRegalia  = Math.random() < 0.05;
      const globalDisc  = hasDiscount ? r2(rnd(2, 20)) : 0;

      // Build detail items
      let lineSubtotal = 0;
      let profit       = 0;
      let regaliaCount = 0;
      const details    = [];

      for (let k = 0; k < chosen.length; k++) {
        const prod    = chosen[k];
        const maxQty  = Math.min(stockMap[prod.id], 3);
        const qty     = ri(1, maxQty);
        const isReg   = hasRegalia && k === chosen.length - 1 && prod.disponible_regalia;
        const regType = isReg ? 'propia' : null;
        const uPrice  = isReg ? 0 : r6(parseFloat(prod.precio_venta_sin_iva) || 0);
        const discPct = (!isReg && hasDiscount && k === 0) ? rnd(2, 15) : 0;
        const discAmt = (!isReg && discPct > 0) ? r2(uPrice * discPct / 100 * qty) : 0;
        const lineSub = isReg ? 0 : r2(uPrice * qty - discAmt);
        const ivaAmt  = isReg ? 0 : r2(lineSub * 0.13);
        const lineTot = isReg ? 0 : r2(lineSub + ivaAmt);
        const costo   = parseFloat(prod.precio_costo) || 0;

        lineSubtotal += lineSub;
        if (!isReg) profit = r2(profit + (uPrice - costo) * qty - discAmt);
        if (isReg && regType === 'propia') { profit = r2(profit - costo * qty); regaliaCount += qty; }

        // Only decrement stock for non-cancelled sales
        if (status !== 'Cancelada') stockMap[prod.id] = Math.max(0, stockMap[prod.id] - qty);

        details.push({
          product_id:          prod.id,
          product_name:        prod.name,
          quantity:            qty,
          unit_price:          isReg ? 0 : uPrice,
          subtotal:            lineSub,
          is_regalia:          isReg,
          regalia_type:        regType,
          cost_price:          costo > 0 ? r6(costo) : null,
          discount_amount:     r6(discAmt),
          discount_percentage: r6(discPct),
          iva_amount:          r6(ivaAmt),
          line_total:          r6(lineTot),
        });
      }

      const subtotal = r2(Math.max(0, lineSubtotal - globalDisc));
      const tax      = r2(subtotal * 0.13);
      const total    = r2(subtotal + tax);

      saleRows.push({
        payment_method: payMethod,
        status,
        subtotal,
        tax,
        total,
        profit:          r2(profit),
        global_discount: r6(globalDisc),
        regalia_count:   regaliaCount,
        customer_id:     customer?.id   ?? null,
        customer_name:   customer?.name ?? null,
        created_at:      isoDate(saleDate),
        // detail items carried alongside (stripped before insert)
        _details: details,
      });
    }

    // Insert sales, then details (need sale IDs)
    console.log(`   Insertando ${saleRows.length} ventas…`);
    let inserted = 0;
    for (const row of saleRows) {
      const { _details, ...saleData } = row;
      const res = await AppDataSource.createQueryBuilder()
        .insert().into('sales').values(saleData).execute();
      const saleId = res.identifiers[0].id;

      const dRows = _details.map(d => ({ ...d, sale_id: saleId }));
      if (dRows.length) await bulkInsert('sale_details', dRows, 50);

      if (saleData.status === 'Completada') {
        completedSalesForReturns.push({
          saleId,
          date: new Date(saleData.created_at),
          details: _details.map(d => ({
            product_id: d.product_id, product_name: d.product_name,
            qty: d.quantity, unit_price: d.unit_price,
          })),
        });
      }
      inserted++;
      if (inserted % 300 === 0) process.stdout.write(`   … ${inserted}/${saleRows.length}\n`);
    }
    console.log(`✅ Ventas: ${saleRows.length} creadas`);
  }

  // ── 7. Returns ───────────────────────────────────────────────────────────
  if (await repo('Return').count() > 0) {
    console.log(`⏭  Devoluciones: ${await repo('Return').count()} existentes, omitiendo`);
  } else if (completedSalesForReturns.length === 0) {
    console.log(`⚠  Sin ventas completadas disponibles para devoluciones, omitiendo`);
  } else {
    // Pick 80 random completed sales
    const pool    = [...completedSalesForReturns];
    const targets = [];
    const n       = Math.min(80, pool.length);
    for (let i = 0; i < n; i++) {
      const idx = ri(0, pool.length - 1);
      targets.push(...pool.splice(idx, 1));
    }

    let retCreated = 0;
    for (const sale of targets) {
      // Pick 1–2 items to return
      const retItems = [];
      const items    = sale.details.filter(d => !d.is_regalia && d.qty > 0);
      if (!items.length) continue;

      const nRet = Math.min(ri(1, 2), items.length);
      for (let k = 0; k < nRet; k++) {
        const item  = items[k];
        const retQty = ri(1, item.qty);
        retItems.push({ ...item, retQty });
      }

      const totalRefunded = r2(retItems.reduce((s, i) => s + i.unit_price * i.retQty, 0));
      const isPartial     = nRet < sale.details.length || retItems.some(i => i.retQty < i.qty);

      // Return date: 1–14 days after sale
      const retDate = new Date(sale.date.getTime() + ri(1, 14) * 86400_000);
      if (retDate > END) continue;

      const retRow = {
        sale_id:       sale.saleId,
        reason:        pick(RETURN_REASONS),
        notes:         Math.random() < 0.4 ? 'Cliente notificado, reembolso procesado' : null,
        total_refunded: totalRefunded,
        is_partial:    isPartial,
        created_at:    isoDate(retDate),
      };
      const retRes = await AppDataSource.createQueryBuilder()
        .insert().into('returns').values(retRow).execute();
      const returnId = retRes.identifiers[0].id;

      const rdRows = retItems.map(i => ({
        return_id:    returnId,
        product_id:   i.product_id,
        product_name: i.product_name,
        quantity:     i.retQty,
        unit_price:   i.unit_price,
        subtotal:     r2(i.unit_price * i.retQty),
      }));
      await bulkInsert('return_details', rdRows, 50);

      // Restore stock
      for (const i of retItems) {
        if (stockMap[i.product_id] !== undefined) stockMap[i.product_id] += i.retQty;
      }

      // Update sale status
      await AppDataSource.createQueryBuilder()
        .update('sales')
        .set({ status: isPartial ? 'Parcial' : 'Devuelta' })
        .where('id = :id', { id: sale.saleId })
        .execute();

      retCreated++;
    }
    console.log(`✅ Devoluciones: ${retCreated} creadas`);
  }

  // ── 8. Recalculate & persist final stock ─────────────────────────────────
  console.log('\n   Actualizando stock final de productos…');
  for (const prod of products) {
    const finalStock = Math.max(0, stockMap[prod.id] ?? 0);
    await AppDataSource.createQueryBuilder()
      .update('products')
      .set({ stock: finalStock })
      .where('id = :id', { id: prod.id })
      .execute();
  }
  console.log('✅ Stock de productos actualizado');

  // ── 9. Summary ───────────────────────────────────────────────────────────
  const [sc, dc, ec, rc, cc] = await Promise.all([
    repo('Sale').count(), repo('SaleDetail').count(),
    repo('StockEntry').count(), repo('Return').count(),
    repo('Customer').count(),
  ]);
  console.log('\n───────────────────────────────────────');
  console.log('🎉  Seed completado');
  console.log(`   Categorías  : ${cats.length}`);
  console.log(`   Proveedores : ${suppliers.length}`);
  console.log(`   Productos   : ${products.length}`);
  console.log(`   Clientes    : ${cc}`);
  console.log(`   Entradas    : ${ec}`);
  console.log(`   Ventas      : ${sc}  (${dc} líneas)`);
  console.log(`   Devoluciones: ${rc}`);
  console.log('───────────────────────────────────────\n');

  await AppDataSource.destroy();
}

seed()
  .then(() => process.exit(0))
  .catch(err => { console.error('\n❌ Error en seed:', err.message || err); process.exit(1); });
