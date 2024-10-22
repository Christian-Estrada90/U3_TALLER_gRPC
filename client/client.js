const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader');
const express = require('express');
const path = require('path');

const PROTO_PATH = './proto/producto.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const productoProto = grpc.loadPackageDefinition(packageDefinition).producto;
const PORT = process.env.PORT || 3000;
// Crea un cliente
const client = new productoProto.ProductService('localhost:50051', grpc.credentials.createInsecure());
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir el archivo HTML

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
// Ruta para obtener un producto por ID
app.post('/products', (req, res) => {
  const productId = req.body.product_id; // Obtiene el ID del cuerpo de la solicitud

  client.getProduct({ id: productId }, (error, data) => {
    if (!error) {
      console.log(data);
      res.send(data);
    } else {
      console.error(error);
      res.status(500).send({ msg: error.message });
    }
  });
});

// Ruta para listar todos los productos
app.get('/list-products', (req, res) => {
  // El método ListProduct no requiere parámetros, por lo que llamamos al cliente sin argumentos.
  client.ListProduct({}, (error, data) => {
    if (!error) {
      console.log(data); // Aquí obtendrás la lista de productos
      res.send(data.products); // Enviar la lista de productos al cliente
    } else {
      console.error(error);
      res.status(500).send({ msg: error.message });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Sevidor en ejecucion en  http://localhost:${PORT}`);
});