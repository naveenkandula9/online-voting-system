import { useEffect, useMemo, useState } from 'react';

import api from '../services/api';

const STATES = ['Andhra Pradesh', 'Telangana'];

const emptyCandidate = {
  name: '',
  party: '',
  partySymbol: '',
  state: '',
};

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [results, setResults] = useState({ totalVotes: 0, stateWiseResults: [] });
  const [election, setElection] = useState(null);
  const [candidateForm, setCandidateForm] = useState(emptyCandidate);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const verifiedUsers = useMemo(() => users.filter((user) => user.isVerified).length, [users]);
  const votedUsers = useMemo(() => users.filter((user) => user.hasVoted).length, [users]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [candidateResponse, userResponse, logResponse, resultResponse, electionResponse, complaintResponse] =
        await Promise.all([
          api.get('/api/candidates'),
          api.get('/api/admin/users'),
          api.get('/api/admin/logs'),
          api.get('/api/results'),
          api.get('/api/admin/election'),
          api.get('/api/complaints/admin/all'),
        ]);

      setCandidates(candidateResponse.data.candidates || []);
      setUsers(userResponse.data.users || []);
      setLogs(logResponse.data.logs || []);
      setResults({
        totalVotes: resultResponse.data.totalVotes || 0,
        stateWiseResults: resultResponse.data.stateWiseResults || [],
      });
      setElection(electionResponse.data.election || null);
      setComplaints(complaintResponse.data.complaints || []);
    } catch (error) {
      setMessage({ type: 'danger', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const updateCandidateField = (event) => {
    const { name, value } = event.target;

    setCandidateForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetCandidateForm = () => {
    setCandidateForm(emptyCandidate);
    setEditingId('');
  };

  const saveCandidate = async (event) => {
    event.preventDefault();

    if (
      !candidateForm.name.trim() ||
      !candidateForm.party.trim() ||
      !candidateForm.state.trim() ||
      !candidateForm.partySymbol.trim()
    ) {
      setMessage({
        type: 'danger',
        text: 'Candidate name, party, party symbol, and state are required.',
      });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      if (editingId) {
        await api.put(`/api/admin/candidate/${editingId}`, candidateForm);
        setMessage({ type: 'success', text: 'Candidate updated successfully.' });
      } else {
        await api.post('/api/admin/candidate', candidateForm);
        setMessage({ type: 'success', text: 'Candidate added successfully.' });
      }

      resetCandidateForm();
      await fetchAdminData();
    } catch (error) {
      setMessage({ type: 'danger', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const editCandidate = (candidate) => {
    setEditingId(candidate._id);
    setCandidateForm({
      name: candidate.name,
      party: candidate.party,
      partySymbol: candidate.partySymbol,
      state: candidate.state,
    });
  };

  const deleteCandidate = async (candidateId) => {
    if (!window.confirm('Delete this candidate?')) {
      return;
    }

    try {
      await api.delete(`/api/admin/candidate/${candidateId}`);
      setMessage({ type: 'success', text: 'Candidate deleted successfully.' });
      await fetchAdminData();
    } catch (error) {
      setMessage({ type: 'danger', text: error.message });
    }
  };

  const startElection = async () => {
    try {
      const response = await api.post('/api/admin/election/start', {});
      setElection(response.data.election);
      setMessage({ type: 'success', text: 'Election started.' });
      await fetchAdminData();
    } catch (error) {
      setMessage({ type: 'danger', text: error.message });
    }
  };

  const stopElection = async () => {
    try {
      const response = await api.post('/api/admin/election/stop');
      setElection(response.data.election);
      setMessage({ type: 'success', text: 'Election stopped.' });
      await fetchAdminData();
    } catch (error) {
      setMessage({ type: 'danger', text: error.message });
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      await api.put(`/api/complaints/${complaintId}/status`, { status: newStatus });
      setMessage({ type: 'success', text: 'Complaint status updated.' });
      await fetchAdminData();
    } catch (error) {
      setMessage({ type: 'danger', text: error.message });
    }
  };

  return (
    <main className="container py-5">
      <div className="page-header mb-4">
        <p className="text-primary fw-semibold mb-1">Admin</p>
        <h1 className="h2 fw-bold">Dashboard</h1>
        <p className="text-secondary mb-0">
          Manage candidates, election status, voter monitoring, analytics, and audit logs.
        </p>
      </div>

      {message.text ? (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      ) : null}

      {loading ? (
        <section className="auth-panel p-4 text-secondary">Loading admin dashboard...</section>
      ) : (
        <div className="d-grid gap-4">
          <section className="row g-3">
            <div className="col-md-3">
              <div className="status-panel p-4 h-100">
                <div className="text-secondary small">Election</div>
                <div className={`h4 fw-bold mb-0 ${election?.isActive ? 'text-success' : 'text-danger'}`}>
                  {election?.isActive ? 'Active' : 'Stopped'}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="status-panel p-4 h-100">
                <div className="text-secondary small">Total votes</div>
                <div className="h4 fw-bold mb-0">{results.totalVotes}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="status-panel p-4 h-100">
                <div className="text-secondary small">Verified users</div>
                <div className="h4 fw-bold mb-0">{verifiedUsers}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="status-panel p-4 h-100">
                <div className="text-secondary small">Voted users</div>
                <div className="h4 fw-bold mb-0">{votedUsers}</div>
              </div>
            </div>
          </section>

          <section className="auth-panel p-4">
            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <div>
                <h2 className="h5 fw-semibold mb-1">Election control</h2>
                <p className="text-secondary mb-0">Start or stop voting access for all users.</p>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-success" disabled={election?.isActive} onClick={startElection}>
                  Start Election
                </button>
                <button className="btn btn-danger" disabled={!election?.isActive} onClick={stopElection}>
                  Stop Election
                </button>
              </div>
            </div>
          </section>

          <section className="row g-4">
            <div className="col-lg-4">
              <form className="auth-panel p-4 h-100" onSubmit={saveCandidate}>
                <h2 className="h5 fw-semibold mb-3">
                  {editingId ? 'Edit candidate' : 'Add candidate'}
                </h2>
                <div className="mb-3">
                  <label className="form-label" htmlFor="candidateName">
                    Name
                  </label>
                  <input
                    className="form-control"
                    id="candidateName"
                    name="name"
                    onChange={updateCandidateField}
                    value={candidateForm.name}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="candidateParty">
                    Party
                  </label>
                  <input
                    className="form-control"
                    id="candidateParty"
                    name="party"
                    onChange={updateCandidateField}
                    value={candidateForm.party}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="candidateSymbol">
                    Party Symbol (Image URL)
                  </label>
                  <input
                    className="form-control"
                    id="candidateSymbol"
                    name="partySymbol"
                    onChange={updateCandidateField}
                    placeholder="e.g., /images/bjp.jpg"
                    value={candidateForm.partySymbol}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label" htmlFor="candidateState">
                    State
                  </label>
                  <select
                    className="form-control"
                    id="candidateState"
                    name="state"
                    onChange={updateCandidateField}
                    value={candidateForm.state}
                  >
                    <option value="">Select a state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="d-grid gap-2">
                  <button className="btn btn-primary" disabled={saving} type="submit">
                    {saving ? 'Saving...' : editingId ? 'Update Candidate' : 'Add Candidate'}
                  </button>
                  {editingId ? (
                    <button className="btn btn-outline-dark" onClick={resetCandidateForm} type="button">
                      Cancel Edit
                    </button>
                  ) : null}
                </div>
              </form>
            </div>

            <div className="col-lg-8">
              <section className="auth-panel p-4 h-100">
                <h2 className="h5 fw-semibold mb-3">Candidates</h2>
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Party</th>
                        <th>Symbol</th>
                        <th>State</th>
                        <th className="text-end">Votes</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.map((candidate) => (
                        <tr key={candidate._id}>
                          <td className="fw-semibold">{candidate.name}</td>
                          <td>{candidate.party}</td>
                          <td>
                            <img
                              alt={candidate.party}
                              src={candidate.partySymbol || '/images/default-party.png'}
                              style={{ height: '30px', width: '30px', objectFit: 'contain' }}
                            />
                          </td>
                          <td>{candidate.state}</td>
                          <td className="text-end">{candidate.voteCount}</td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary" onClick={() => editCandidate(candidate)}>
                                Edit
                              </button>
                              <button className="btn btn-outline-danger" onClick={() => deleteCandidate(candidate._id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </section>

          <section className="auth-panel p-4">
            <h2 className="h5 fw-semibold mb-3">Users</h2>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>State</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Voted</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="fw-semibold">{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{user.state || '-'}</td>
                      <td>{user.role}</td>
                      <td>{user.isVerified ? 'Yes' : 'No'}</td>
                      <td>{user.hasVoted ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="auth-panel p-4">
            <h2 className="h5 fw-semibold mb-3">Recent activity</h2>
            <div className="activity-list">
              {logs.slice(0, 12).map((log) => (
                <div className="activity-row py-3" key={log._id}>
                  <div className="fw-semibold">{log.action}</div>
                  <div className="text-secondary small">
                    {new Date(log.createdAt).toLocaleString()} · {log.actor?.name || 'System'}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="auth-panel p-4">
            <h2 className="h5 fw-semibold mb-3">User Complaints</h2>
            {complaints.length === 0 ? (
              <div className="text-secondary">No complaints submitted yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Complaint</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((complaint) => (
                      <tr key={complaint._id}>
                        <td className="fw-semibold">{complaint.user?.name}</td>
                        <td>
                          <small>{complaint.message.substring(0, 50)}...</small>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            onChange={(e) => updateComplaintStatus(complaint._id, e.target.value)}
                            value={complaint.status}
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                        <td>
                          <small className="text-secondary">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </small>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-outline-info btn-sm"
                            title={complaint.message}
                            type="button"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;
