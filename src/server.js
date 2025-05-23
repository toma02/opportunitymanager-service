require('dotenv').config();
const app = require('./app');
const http = require('http');
const { Client } = require('pg');
const socketIo = require('socket.io');

const PORT = process.env.PORT || 8888;

const server = http.createServer(app);

const io = socketIo(server, { cors: { origin: '*' } });

const pgClient = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});
pgClient.connect();

pgClient.query('LISTEN event_channel');

pgClient.on('notification', (msg) => {
  io.emit('event:changed', msg.payload);
  console.log('Event change:', msg.payload);
});

server.listen(PORT, () => {
  console.log(`Event API radi na portu ${PORT}`);
});
