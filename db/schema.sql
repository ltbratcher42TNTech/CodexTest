CREATE DATABASE IF NOT EXISTS swollenhippo_timeclock;
USE swollenhippo_timeclock;

CREATE TABLE IF NOT EXISTS Employees (
  EmployeeID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  Name VARCHAR(100) NOT NULL,
  Email VARCHAR(150) NOT NULL UNIQUE,
  PIN VARCHAR(255) NOT NULL,
  Role ENUM('employee', 'admin') NOT NULL DEFAULT 'employee',
  Active TINYINT(1) NOT NULL DEFAULT 1,
  CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (EmployeeID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TimeEntries (
  EntryID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  EmployeeID INT UNSIGNED NOT NULL,
  ClockIn DATETIME NOT NULL,
  ClockOut DATETIME NULL,
  PRIMARY KEY (EntryID),
  INDEX idxEmployeeClockIn (EmployeeID, ClockIn),
  CONSTRAINT fkTimeEntriesEmployee FOREIGN KEY (EmployeeID)
    REFERENCES Employees(EmployeeID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Example seed after generating a bcrypt hash:
-- node -e "require('bcrypt').hash('1234', 10).then(console.log)"
-- INSERT INTO Employees (Name, Email, PIN, Role, Active)
-- VALUES ('Admin User', 'admin@swollenhippo.coffee', '<BCRYPT_HASH>', 'admin', 1);
