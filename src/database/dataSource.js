'use strict';

/**
 * Shared TypeORM DataSource configuration.
 * Used by both src/main/main.js (Electron) and src/database/seed.js (CLI).
 * The DB path is injected via createDataSource(dbPath) so each caller
 * supplies its own location (app.getPath('userData') vs APPDATA env var).
 */

const { DataSource, EntitySchema } = require('typeorm');

// ── Schemas ───────────────────────────────────────────────────────────────────

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
    photo_path: { type: String, nullable: true },
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

const InventoryAdjustmentSchema = new EntitySchema({
  name: 'InventoryAdjustment',
  tableName: 'inventory_adjustments',
  columns: {
    id: { type: Number, primary: true, generated: true },
    product_id: { type: Number, index: true },
    product_name: { type: String },
    adjustment_amount: { type: Number }, // signed: positive = increase, negative = decrease
    quantity_before: { type: Number },
    quantity_after: { type: Number },
    reason: { type: String },
    notes: { type: String, nullable: true },
    created_at: { type: 'datetime', createDate: true },
  },
});

// ── Ordered entity list (same order used by main.js and seed.js) ──────────────

const ENTITIES = [
  ProductSchema, CategorySchema, CustomerSchema,
  SaleSchema, SaleDetailSchema,
  SupplierSchema, StockEntrySchema,
  ReturnSchema, ReturnDetailSchema,
  BonificacionPriceLogSchema, UserSchema, AuditLogSchema,
  InventoryAdjustmentSchema,
];

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Returns an uninitialised DataSource for the given SQLite file path.
 * Call `.initialize()` before use.
 */
function createDataSource(dbPath) {
  return new DataSource({
    type: 'sqlite',
    database: dbPath,
    entities: ENTITIES,
    synchronize: true,
    logging: false,
  });
}

module.exports = { createDataSource, ENTITIES };
