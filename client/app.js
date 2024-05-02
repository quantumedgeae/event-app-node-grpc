import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { credentials as _credentials, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { fileURLToPath } from 'url';

const PROTO_PATH = "../events.proto";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = dirname(__filename); // get the name of the directory

let packageDefinition = loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true
});

const credentials = _credentials.createSsl(
  readFileSync(join(__dirname, '../scripts/certs/ca.crt')),
  readFileSync(join(__dirname, '../scripts/certs/client.key')),
  readFileSync(join(__dirname, '../scripts/certs/client.crt'))
);

const EventService = loadPackageDefinition(packageDefinition).EventService;
//establishing an insecure connection
//const client = new EventService("127.0.0.1:50051",grpc.credentials.createInsecure());
const client = new EventService("localhost:50051", credentials);
export default client;
