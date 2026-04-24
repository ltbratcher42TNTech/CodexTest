const express = require('express');
const { createEmployee, getEmployees, getAllTimeEntries } = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const objRouter = express.Router();

objRouter.post('/employees', authenticate, authorizeAdmin, createEmployee);
objRouter.get('/employees', authenticate, authorizeAdmin, getEmployees);
objRouter.get('/entries', authenticate, authorizeAdmin, getAllTimeEntries);

module.exports = objRouter;
