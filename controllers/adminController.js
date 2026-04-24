const bcrypt = require('bcrypt');
const objPool = require('../db/pool');

const isEmailValid = (strEmail) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strEmail);
const isPinValid = (strPin) => /^\d{4,8}$/.test(strPin);

const createEmployee = async (reqRequest, resResponse) => {
  try {
    const strName = String(reqRequest.body.name || '').trim();
    const strEmail = String(reqRequest.body.email || '').trim().toLowerCase();
    const strPin = String(reqRequest.body.pin || '').trim();
    const strRole = String(reqRequest.body.role || 'employee').trim();
    const boolActive = reqRequest.body.active !== false;

    if (strName.length < 2) {
      return resResponse.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
    }

    if (!isEmailValid(strEmail)) {
      return resResponse.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (!isPinValid(strPin)) {
      return resResponse.status(400).json({ success: false, message: 'PIN must be 4-8 numeric digits' });
    }

    if (!['employee', 'admin'].includes(strRole)) {
      return resResponse.status(400).json({ success: false, message: 'Role must be employee or admin' });
    }

    const [arrExisting] = await objPool.query('SELECT EmployeeID FROM Employees WHERE Email = ?', [strEmail]);
    if (arrExisting.length > 0) {
      return resResponse.status(409).json({ success: false, message: 'Email already exists' });
    }

    const strHashedPin = await bcrypt.hash(strPin, 10);
    const [objInsert] = await objPool.query(
      'INSERT INTO Employees (Name, Email, PIN, Role, Active) VALUES (?, ?, ?, ?, ?)',
      [strName, strEmail, strHashedPin, strRole, boolActive ? 1 : 0]
    );

    return resResponse.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        employeeId: objInsert.insertId,
        name: strName,
        email: strEmail,
        role: strRole,
        active: boolActive
      }
    });
  } catch (objError) {
    console.error('createEmployee error', objError);
    return resResponse.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getEmployees = async (reqRequest, resResponse) => {
  try {
    const [arrEmployees] = await objPool.query(
      'SELECT EmployeeID, Name, Email, Role, Active FROM Employees ORDER BY EmployeeID DESC'
    );

    return resResponse.status(200).json({ success: true, message: 'Employees retrieved', data: arrEmployees });
  } catch (objError) {
    console.error('getEmployees error', objError);
    return resResponse.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllTimeEntries = async (reqRequest, resResponse) => {
  try {
    const [arrEntries] = await objPool.query(
      `SELECT te.EntryID, te.EmployeeID, e.Name, e.Email, te.ClockIn, te.ClockOut
       FROM TimeEntries te
       INNER JOIN Employees e ON e.EmployeeID = te.EmployeeID
       ORDER BY te.ClockIn DESC
       LIMIT 500`
    );

    return resResponse.status(200).json({ success: true, message: 'Time entries retrieved', data: arrEntries });
  } catch (objError) {
    console.error('getAllTimeEntries error', objError);
    return resResponse.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { createEmployee, getEmployees, getAllTimeEntries };
