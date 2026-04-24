const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const objPool = require('../db/pool');

const isPinValid = (strPin) => /^\d{4,8}$/.test(strPin);

const createToken = (objEmployee) => {
  return jwt.sign(
    {
      employeeId: objEmployee.EmployeeID,
      role: objEmployee.Role,
      name: objEmployee.Name,
      email: objEmployee.Email
    },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
};

const login = async (reqRequest, resResponse) => {
  try {
    const strPin = String(reqRequest.body.pin || '').trim();

    if (!isPinValid(strPin)) {
      return resResponse.status(400).json({ success: false, message: 'PIN must be 4-8 numeric digits' });
    }

    const [arrEmployees] = await objPool.query(
      'SELECT EmployeeID, Name, Email, PIN, Role FROM Employees WHERE Active = 1'
    );

    let objMatchedEmployee = null;

    for (const objEmployee of arrEmployees) {
      const boolMatched = await bcrypt.compare(strPin, objEmployee.PIN);
      if (boolMatched) {
        objMatchedEmployee = objEmployee;
        break;
      }
    }

    if (!objMatchedEmployee) {
      return resResponse.status(401).json({ success: false, message: 'Invalid PIN' });
    }

    const strToken = createToken(objMatchedEmployee);

    return resResponse.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token: strToken,
        employee: {
          employeeId: objMatchedEmployee.EmployeeID,
          name: objMatchedEmployee.Name,
          email: objMatchedEmployee.Email,
          role: objMatchedEmployee.Role
        }
      }
    });
  } catch (objError) {
    console.error('login error', objError);
    return resResponse.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const me = async (reqRequest, resResponse) => {
  return resResponse.status(200).json({
    success: true,
    message: 'Authenticated user',
    data: [
      {
        employeeId: reqRequest.user.employeeId,
        name: reqRequest.user.name,
        email: reqRequest.user.email,
        role: reqRequest.user.role
      }
    ]
  });
};

module.exports = { login, me };
