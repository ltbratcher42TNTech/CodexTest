const objState = {
  strToken: localStorage.getItem('token') || '',
  objUser: null,
  boolClockedIn: false
};

const byId = (strId) => document.getElementById(strId);

const showAlert = (strMessage, strType = 'info') => {
  byId('divAlert').innerHTML = `
    <div class="alert alert-${strType} alert-dismissible fade show" role="alert">
      ${strMessage}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
};

const formatDate = (strDate) => {
  if (!strDate) return '-';
  return new Date(strDate).toISOString().replace('T', ' ').slice(0, 19);
};

const calcHours = (strClockIn, strClockOut) => {
  if (!strClockIn || !strClockOut) return '-';
  const intMs = new Date(strClockOut) - new Date(strClockIn);
  if (Number.isNaN(intMs) || intMs <= 0) return '-';
  return (intMs / 3600000).toFixed(2);
};

const apiFetch = async (strPath, objOptions = {}) => {
  const objResponse = await fetch(strPath, {
    ...objOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(objState.strToken ? { Authorization: `Bearer ${objState.strToken}` } : {})
    }
  });

  const objPayload = await objResponse.json();
  if (!objResponse.ok || objPayload.success === false) {
    throw new Error(objPayload.message || 'Request failed');
  }

  return objPayload;
};

const renderSession = () => {
  const boolLoggedIn = Boolean(objState.strToken && objState.objUser);
  byId('secLogin').classList.toggle('d-none', boolLoggedIn);
  byId('secDashboard').classList.toggle('d-none', !boolLoggedIn);
  byId('btnLogout').classList.toggle('d-none', !boolLoggedIn);
  byId('spnName').textContent = objState.objUser ? objState.objUser.name : '-';

  const boolAdmin = objState.objUser?.role === 'admin';
  byId('secAdmin').classList.toggle('d-none', !boolAdmin);
};

const renderStatus = (boolClockedIn) => {
  objState.boolClockedIn = boolClockedIn;
  byId('spnStatus').textContent = boolClockedIn ? 'Clocked In' : 'Clocked Out';
  byId('spnStatus').className = `badge ${boolClockedIn ? 'text-bg-success' : 'text-bg-secondary'}`;
  byId('btnToggle').textContent = boolClockedIn ? 'Clock Out' : 'Clock In';
};

const renderMyEntries = (arrEntries) => {
  const objBody = byId('tbMyEntries');
  if (arrEntries.length === 0) {
    objBody.innerHTML = '<tr><td colspan="3" class="text-center">No entries found.</td></tr>';
    return;
  }

  objBody.innerHTML = arrEntries
    .slice(0, 20)
    .map(
      (objEntry) => `<tr>
        <td>${formatDate(objEntry.ClockIn)}</td>
        <td>${formatDate(objEntry.ClockOut)}</td>
        <td>${calcHours(objEntry.ClockIn, objEntry.ClockOut)}</td>
      </tr>`
    )
    .join('');
};

const renderEmployees = (arrEmployees) => {
  const objBody = byId('tbEmployees');
  if (arrEmployees.length === 0) {
    objBody.innerHTML = '<tr><td colspan="5" class="text-center">No employees found.</td></tr>';
    return;
  }

  objBody.innerHTML = arrEmployees
    .map(
      (objEmployee) => `<tr>
        <td>${objEmployee.EmployeeID}</td>
        <td>${objEmployee.Name}</td>
        <td>${objEmployee.Email}</td>
        <td>${objEmployee.Role}</td>
        <td>${objEmployee.Active ? 'Yes' : 'No'}</td>
      </tr>`
    )
    .join('');
};

const renderAllEntries = (arrEntries) => {
  const objBody = byId('tbAllEntries');
  if (arrEntries.length === 0) {
    objBody.innerHTML = '<tr><td colspan="3" class="text-center">No entries found.</td></tr>';
    return;
  }

  objBody.innerHTML = arrEntries
    .slice(0, 50)
    .map(
      (objEntry) => `<tr>
        <td>${objEntry.Name} (${objEntry.Email})</td>
        <td>${formatDate(objEntry.ClockIn)}</td>
        <td>${formatDate(objEntry.ClockOut)}</td>
      </tr>`
    )
    .join('');
};

const refreshUserData = async () => {
  const [objStatusRes, objEntriesRes] = await Promise.all([apiFetch('/api/time/status'), apiFetch('/api/time/me')]);

  renderStatus(Boolean(objStatusRes.data[0] && objStatusRes.data[0].clockedIn));
  renderMyEntries(objEntriesRes.data);
};

const refreshAdminData = async () => {
  if (!objState.objUser || objState.objUser.role !== 'admin') return;

  const [objEmployeesRes, objAllEntriesRes] = await Promise.all([
    apiFetch('/api/admin/employees'),
    apiFetch('/api/admin/entries')
  ]);

  renderEmployees(objEmployeesRes.data);
  renderAllEntries(objAllEntriesRes.data);
};

const logout = () => {
  objState.strToken = '';
  objState.objUser = null;
  localStorage.removeItem('token');
  renderSession();
};

byId('frmLogin').addEventListener('submit', async (objEvent) => {
  objEvent.preventDefault();

  const strPin = String(byId('txtPin').value || '').trim();

  if (!/^\d{4,8}$/.test(strPin)) {
    showAlert('PIN must be 4-8 digits.', 'warning');
    return;
  }

  try {
    const objLoginRes = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ pin: strPin })
    });

    objState.strToken = objLoginRes.data.token;
    objState.objUser = objLoginRes.data.employee;
    localStorage.setItem('token', objState.strToken);

    renderSession();
    await refreshUserData();
    await refreshAdminData();
    byId('txtPin').value = '';
    showAlert('Login successful.', 'success');
  } catch (objError) {
    showAlert(objError.message, 'danger');
  }
});

byId('btnToggle').addEventListener('click', async () => {
  try {
    const objToggleRes = await apiFetch('/api/time/toggle', { method: 'POST' });
    showAlert(objToggleRes.message, 'success');
    await refreshUserData();
    await refreshAdminData();
  } catch (objError) {
    showAlert(objError.message, 'danger');
  }
});

byId('frmCreateEmployee').addEventListener('submit', async (objEvent) => {
  objEvent.preventDefault();

  const objForm = new FormData(objEvent.currentTarget);
  const objBody = {
    name: String(objForm.get('name') || '').trim(),
    email: String(objForm.get('email') || '').trim(),
    pin: String(objForm.get('pin') || '').trim(),
    role: String(objForm.get('role') || 'employee').trim()
  };

  try {
    const objCreateRes = await apiFetch('/api/admin/employees', {
      method: 'POST',
      body: JSON.stringify(objBody)
    });

    showAlert(`Employee created with ID ${objCreateRes.data.employeeId}.`, 'success');
    objEvent.currentTarget.reset();
    await refreshAdminData();
  } catch (objError) {
    showAlert(objError.message, 'danger');
  }
});

byId('btnLogout').addEventListener('click', () => {
  logout();
  showAlert('Logged out.', 'info');
});

const init = async () => {
  try {
    if (!objState.strToken) {
      renderSession();
      return;
    }

    const objMeRes = await apiFetch('/api/auth/me');
    if (!Array.isArray(objMeRes.data) || objMeRes.data.length === 0) {
      throw new Error('Session invalid');
    }

    objState.objUser = objMeRes.data[0];
    renderSession();
    await refreshUserData();
    await refreshAdminData();
  } catch (objError) {
    logout();
    showAlert('Session expired. Please sign in again.', 'warning');
  }
};

init();
