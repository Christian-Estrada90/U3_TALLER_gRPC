const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');


const app = express();
app.use(express.json());
app.use(express.static('public')); // Para servir archivos estáticos

// Cargar el archivo .proto
const PROTO_PATH = path.join(__dirname, 'products.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const productProto = grpc.loadPackageDefinition(packageDefinition).products;

// Crear un cliente gRPC
const client = new productProto.ProductService('localhost:50051', grpc.credentials.createInsecure());

// Ruta para obtener todos los productos
app.get('/products', (req, res) => {
  client.GetAllProducts({}, (error, response) => {
    if (error) {
      return res.status(500).send('Error retrieving products');
    }
    res.json(response.products);
  });
});

// Ruta para buscar producto por ID
app.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  client.GetProductById({ id }, (error, response) => {
    if (error) {
      return res.status(404).send('Product not found');
    }
    res.json(response);
  });
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Web server running at http://localhost:${PORT}`);
});
