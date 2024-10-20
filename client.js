const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Cargar el archivo .proto
const PROTO_PATH = path.join(__dirname, 'products.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const productProto = grpc.loadPackageDefinition(packageDefinition).products;

// Crear un cliente
const client = new productProto.ProductService('localhost:50051', grpc.credentials.createInsecure());

// Obtener todos los productos
client.GetAllProducts({}, (error, response) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Products:', response.products);
  }
});

// Obtener producto por ID
client.GetProductById({ id: 1 }, (error, response) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Product:', response);
  }
});
