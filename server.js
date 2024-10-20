const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader');
const { Pool } = require('pg');

const PROTO_PATH = './northwind.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const northwindProto = grpc.loadPackageDefinition(packageDefinition).northwind;

// Configura la conexión a la base de datos
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'northwind',
  password: 'admin',
  port: 5432,
});

// Implementa el método GetProduct
const getProduct = async (call, callback) => {
  const id = call.request.id;

  try {
    const res = await pool.query('SELECT product_id, product_name, unit_price FROM products WHERE product_id = $1', [id]);
    if (res.rows.length > 0) {
      const product = res.rows[0];
      callback(null, {
        id: product.product_id,
        name: product.product_name,
        price: parseFloat(product.unit_price),
      });
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Product not found"
      });
    }
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: error.message,
    });
  }
};

// Inicia el servidor gRPC
const server = new grpc.Server();
server.addService(northwindProto.ProductService.service, { GetProduct: getProduct });

const PORT = 'localhost:50051';
server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(`Server running at http://${PORT}`);
  server.start();
});
