const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

const objAuthRoutes = require('./routes/authRoutes');
const objTimeRoutes = require('./routes/timeRoutes');
const objAdminRoutes = require('./routes/adminRoutes');

dotenv.config();

const objApp = express();
const intPort = Number(process.env.PORT || 3000);

objApp.use(express.json({ limit: '1mb' }));
objApp.use(express.urlencoded({ extended: false }));

objApp.use('/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
objApp.use('/api/auth', objAuthRoutes);
objApp.use('/api/time', objTimeRoutes);
objApp.use('/api/admin', objAdminRoutes);

objApp.get('/api/health', (reqRequest, resResponse) => {
  return resResponse.status(200).json({ success: true, message: 'Healthy', data: [] });
});

objApp.use(express.static(path.join(__dirname, 'public')));

objApp.get('*', (reqRequest, resResponse) => {
  return resResponse.sendFile(path.join(__dirname, 'public', 'index.html'));
});

objApp.listen(intPort, () => {
  console.log(`SwollenHippo Coffee app listening on port ${intPort}`);
});
