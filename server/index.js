import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { loadPackageDefinition, Server, ServerCredentials, status as _status } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { fileURLToPath } from 'url';

const PROTO_PATH = "./events.proto";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = dirname(__filename); // get the name of the directory

let packageDefinition = loadSync(PROTO_PATH, {
	keepCase: true,
	longs: String,
	enums: String,
	arrays: true
});

let eventsProto = loadPackageDefinition(packageDefinition);

const server = new Server();

let credentials = ServerCredentials.createSsl(
	readFileSync(join(__dirname, '../scripts/certs/ca.crt')), [{
		cert_chain: readFileSync(join(__dirname, '../scripts/certs/server.crt')),
		private_key: readFileSync(join(__dirname, '../scripts/certs/server.key'))
	}], true);

import { randomUUID } from "node:crypto";
const events = [
	{
		id: "34415c7c-f82d-4e44-88ca-ae2a1aaa92b7",
		name: "Vitalis's Birthday Party",
		description: "Vitalis's 27th Birthday in Paris",
		location: "Paris France",
		duration: "All Day",
		lucky_number: 27,
		status: "Pending"
	},
];

server.addService(eventsProto.EventService.service, {

	getAllEvents: (_, callback) => {
    // console.log("getAllEvents: ", call.request);
		callback(null, { events });
	},

	getEvent: (call, callback) => {
    // console.log("getEvent: ", call.request);
		let event = events.find(n => n.id == call.request.id);

		if (event) {
			callback(null, event);
		} else {
			callback({
				code: _status.NOT_FOUND,
				details: "Event Not found"
			});
		}
	},

	createEvent: (call, callback) => {
    // console.log("createEvent: ", call.request);
		let event = call.request;

		event.id = randomUUID();
		events.push(event);
		callback(null, event);
	},

	updateEvent: (call, callback) => {
    // console.log("updateEvent: ", call.request);
		let existingEvent = events.find(n => n.id == call.request.id);

		if (existingEvent) {
			existingEvent.name = call.request.name;
			existingEvent.description = call.request.description;
			existingEvent.location = call.request.location;
			existingEvent.duration = call.request.duration;
			existingEvent.lucky_number = call.request.lucky_number;
			existingEvent.status = call.request.status;
			callback(null, existingEvent);
		} else {
			callback({
				code: _status.NOT_FOUND,
				details: "Event Not found"
			});
		}
	},

	deleteEvent: (call, callback) => {
    // console.log("deleteEvent: ", call.request);
		let existingEventIndex = events.findIndex(
			n => n.id == call.request.id
		);

		if (existingEventIndex != -1) {
			events.splice(existingEventIndex, 1);
			callback(null, {});
		} else {
			callback({
				code: _status.NOT_FOUND,
				details: "Event Not found"
			});
		}
	}
});

//creating insecure connection without encryption
// server.bindAsync("127.0.0.1:50051", grpc.ServerCredentials.createInsecure(), (error, port) => {
// 	console.log(`Server listening at http://127.0.0.1:${port}`);
// 	server.start();
// });
server.bindAsync("0.0.0.0:50051", credentials, (error, port) => {
	console.log(`Server listening at http://0.0.0.0:${port}`);
	server.start();
});
