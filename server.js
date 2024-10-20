const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { Client } = require('pg');
const path = require('path');

// Cargar el archivo .proto
const PROTO_PATH = path.join(__dirname, 'products.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const productProto = grpc.loadPackageDefinition(packageDefinition).products;

// Conexión a PostgreSQL
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'northwind',
  password: 'admin',
  port: 5432,
});
client.connect();

// Implementar servicios
const getAllProducts = (call, callback) => {
  client.query('SELECT id, name, price FROM products', (error, res) => {
    if (error) {
      callback(error);
    } else {
      const products = res.rows.map(row => ({
        id: row.id,
        name: row.name,
        price: parseFloat(row.price),
      }));
      callback(null, { products });
    }
  });
};

const getProductById = (call, callback) => {
  const { id } = call.request;
  client.query('SELECT id, name, price FROM products WHERE id = $1', [id], (error, res) => {
    if (error || res.rows.length === 0) {
      callback(error || { code: grpc.status.NOT_FOUND, details: 'Product not found' });
    } else {
      const row = res.rows[0];
      callback(null, {
        id: row.id,
        name: row.name,
        price: parseFloat(row.price),
      });
    }
  });
};

// Configurar el servidor
const server = new grpc.Server();
server.addService(productProto.ProductService.service, { GetAllProducts: getAllProducts, GetProductById: getProductById });

const PORT = '50051';
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`gRPC Server running at http://localhost:${PORT}`);
  server.start();
});
