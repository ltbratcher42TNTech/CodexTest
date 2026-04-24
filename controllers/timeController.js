const objPool = require('../db/pool');

const clockToggle = async (reqRequest, resResponse) => {
  try {
    const intEmployeeId = reqRequest.user.employeeId;

    const [arrOpenShifts] = await objPool.query(
      `SELECT EntryID
       FROM TimeEntries
       WHERE EmployeeID = ? AND ClockOut IS NULL
       ORDER BY ClockIn DESC
       LIMIT 1`,
      [intEmployeeId]
    );

    if (arrOpenShifts.length > 0) {
      const intEntryId = arrOpenShifts[0].EntryID;
      await objPool.query('UPDATE TimeEntries SET ClockOut = UTC_TIMESTAMP() WHERE EntryID = ?', [intEntryId]);

      return resResponse.status(200).json({
        success: true,
        message: 'Clocked out successfully',
        data: { entryId: intEntryId, action: 'clock_out' }
      });
    }

    const [objResult] = await objPool.query(
      'INSERT INTO TimeEntries (EmployeeID, ClockIn, ClockOut) VALUES (?, UTC_TIMESTAMP(), NULL)',
      [intEmployeeId]
    );

    return resResponse.status(201).json({
      success: true,
      message: 'Clocked in successfully',
      data: { entryId: objResult.insertId, action: 'clock_in' }
    });
  } catch (objError) {
    console.error('clockToggle error', objError);
    return resResponse.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getMyEntries = async (reqRequest, resResponse) => {
  try {
    const intEmployeeId = reqRequest.user.employeeId;

    const [arrEntries] = await objPool.query(
      `SELECT EntryID, EmployeeID, ClockIn, ClockOut
       FROM TimeEntries
       WHERE EmployeeID = ?
       ORDER BY ClockIn DESC
       LIMIT 100`,
      [intEmployeeId]
    );

    return resResponse.status(200).json({ success: true, message: 'Time entries retrieved', data: arrEntries });
  } catch (objError) {
    console.error('getMyEntries error', objError);
    return resResponse.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getMyStatus = async (reqRequest, resResponse) => {
  try {
    const intEmployeeId = reqRequest.user.employeeId;

    const [arrRows] = await objPool.query(
      `SELECT EntryID, EmployeeID, ClockIn, ClockOut
       FROM TimeEntries
       WHERE EmployeeID = ? AND ClockOut IS NULL
       ORDER BY ClockIn DESC
       LIMIT 1`,
      [intEmployeeId]
    );

    const arrStatus = [
      {
        clockedIn: arrRows.length > 0,
        openEntry: arrRows.length > 0 ? arrRows[0] : null
      }
    ];

    return resResponse.status(200).json({ success: true, message: 'Status retrieved', data: arrStatus });
  } catch (objError) {
    console.error('getMyStatus error', objError);
    return resResponse.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { clockToggle, getMyEntries, getMyStatus };
