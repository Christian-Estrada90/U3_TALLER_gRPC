const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = './northwind.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const northwindProto = grpc.loadPackageDefinition(packageDefinition).northwind;

// Crea un cliente
const client = new northwindProto.ProductService('localhost:50051', grpc.credentials.createInsecure());

// Llama al método GetProduct
client.getProduct({ id: 1 }, (error, response) => {
  if (error) {
    console.error(`Error: ${error.message}`);
  } else {
    console.log(`Product: ${response.name}, Price: ${response.price}`);
  }
});