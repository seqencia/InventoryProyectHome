import { createConnection } from 'typeorm';
import { Product } from './models/product';
import { Customer } from './models/Customer';
import { Sale } from './models/Sale';
import { SaleDetail } from './models/SaleDetail';
import { User } from './models/User';
import 'reflect-metadata';

createConnection({
  type: 'sqlite',
  database: './database.sqlite',
  entities: [Product, Customer, Sale, SaleDetail, User],
  synchronize: true,
  logging: true,
})
  .then(() => {
    console.log('Conexión a la base de datos establecida');
  })
  .catch((error) => {
    console.error('Error al conectar a la base de datos:', error);
  });
