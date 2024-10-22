const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader');
const { Pool } = require('pg');

const PROTO_PATH = './proto/producto.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const productoProto = grpc.loadPackageDefinition(packageDefinition).producto;

// Configura la conexión a la base de datos
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'northwind',
  password: 'admin',
  port: 5432,
});

// Metodo para obtener el producto
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
        details: "Producto no Existe"
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
server.addService(productoProto.ProductService.service, { GetProduct: getProduct });

const PORT = 'localhost:50051';
server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(`El Servidor se esta ejecutando en http://${PORT}`);
  server.start();
});
