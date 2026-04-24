const jwt = require('jsonwebtoken');

const sendUnauthorized = (resResponse, strMessage = 'Unauthorized') => {
  return resResponse.status(401).json({ success: false, message: strMessage });
};

const authenticate = (reqRequest, resResponse, fnNext) => {
  const strAuthHeader = reqRequest.headers.authorization;

  if (!strAuthHeader || !strAuthHeader.startsWith('Bearer ')) {
    return sendUnauthorized(resResponse, 'Missing Bearer token');
  }

  const strToken = strAuthHeader.split(' ')[1];

  try {
    const objPayload = jwt.verify(strToken, process.env.JWT_SECRET);
    reqRequest.user = objPayload;
    return fnNext();
  } catch (objError) {
    return sendUnauthorized(resResponse, 'Invalid or expired token');
  }
};

const authorizeAdmin = (reqRequest, resResponse, fnNext) => {
  if (!reqRequest.user || reqRequest.user.role !== 'admin') {
    return resResponse.status(403).json({ success: false, message: 'Admin access required' });
  }

  return fnNext();
};

module.exports = { authenticate, authorizeAdmin };
