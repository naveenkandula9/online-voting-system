import { useEffect, useState } from 'react';

import api from '../services/api';

const RaiseComplaint = () => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState({ type: '', text: '' });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/complaints');
      setComplaints(response.data.complaints || []);
    } catch (error) {
      setResponseMessage({ type: 'danger', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() || message.trim().length < 10) {
      setResponseMessage({
        type: 'danger',
        text: 'Complaint must be at least 10 characters long.',
      });
      return;
    }

    try {
      setSubmitting(true);
      setResponseMessage({ type: '', text: '' });

      await api.post('/api/complaints', {
        message: message.trim(),
      });

      setMessage('');
      setResponseMessage({
        type: 'success',
        text: 'Your complaint has been submitted successfully.',
      });
      await fetchComplaints();
    } catch (error) {
      setResponseMessage({ type: 'danger', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'open':
        return 'text-bg-warning';
      case 'in-progress':
        return 'text-bg-info';
      case 'resolved':
        return 'text-bg-success';
      default:
        return 'text-bg-secondary';
    }
  };

  return (
    <main className="container py-5">
      <div className="page-header mb-4">
        <p className="text-primary fw-semibold mb-1">Support</p>
        <h1 className="h2 fw-bold">Raise a Complaint</h1>
        <p className="text-secondary mb-0">
          Share any concerns or issues you have with the voting system. Our admin team will review and respond to your complaint.
        </p>
      </div>

      {responseMessage.text ? (
        <div className={`alert alert-${responseMessage.type}`} role="alert">
          {responseMessage.text}
        </div>
      ) : null}

      <div className="row g-4">
        <div className="col-lg-5">
          <section className="auth-panel p-4 h-100">
            <h2 className="h5 fw-semibold mb-3">Submit a Complaint</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="complaintMessage">
                  Your Complaint
                </label>
                <textarea
                  className="form-control"
                  id="complaintMessage"
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your complaint in detail (minimum 10 characters)..."
                  rows="6"
                  value={message}
                />
                <small className="text-secondary d-block mt-1">
                  {message.length}/1000 characters
                </small>
              </div>
              <button
                className="btn btn-primary w-100"
                disabled={submitting}
                type="submit"
              >
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
          </section>
        </div>

        <div className="col-lg-7">
          <section className="auth-panel p-4 h-100">
            <h2 className="h5 fw-semibold mb-3">Your Complaints</h2>
            {loading ? (
              <div className="text-secondary">Loading your complaints...</div>
            ) : complaints.length === 0 ? (
              <div className="text-secondary">
                You haven't submitted any complaints yet.
              </div>
            ) : (
              <div className="complaint-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {complaints.map((complaint) => (
                  <div className="border-bottom pb-3 mb-3" key={complaint._id}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>
                          {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                        </span>
                      </div>
                      <small className="text-secondary">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <p className="mb-1 text-break">{complaint.message}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default RaiseComplaint;
