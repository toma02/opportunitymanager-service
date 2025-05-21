const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const opportunityRoutes = require('./routes/opportunityRoutes');
const keywordRoutes = require('./routes/keywordRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const errorHandler = require('./middlewares/errorHandler');

const allowedOrigins = [
  'http://172.20.10.4:8081',
  'http://192.168.1.9:8081',
  'http://10.24.26.227:8081',
  'http://192.168.1.109:8081'
];

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(bodyParser.json());
app.use('/opportunities', opportunityRoutes);
app.use('/keywords', keywordRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(errorHandler);

module.exports = app;