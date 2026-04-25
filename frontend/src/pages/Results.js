import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import api from '../services/api';

const COLORS = ['#0d6efd', '#198754', '#dc3545', '#6f42c1', '#fd7e14', '#20c997', '#0dcaf0'];

const Results = () => {
  const [results, setResults] = useState({
    totalVotes: 0,
    candidates: [],
    stateWiseResults: [],
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/results');
        setResults({
          totalVotes: response.data.totalVotes || 0,
          candidates: response.data.candidates || [],
          stateWiseResults: response.data.stateWiseResults || [],
        });
      } catch (error) {
        setMessage({ type: 'danger', text: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const topCandidates = useMemo(() => results.candidates.slice(0, 8), [results.candidates]);
  const stateChartData = useMemo(
    () => results.stateWiseResults.map((item) => ({ state: item.state, votes: item.totalVotes })),
    [results.stateWiseResults],
  );

  return (
    <main className="container py-5">
      <div className="page-header mb-4">
        <p className="text-primary fw-semibold mb-1">Live Results</p>
        <h1 className="h2 fw-bold">Results</h1>
        <p className="text-secondary mb-0">
          Candidate-wise and state-wise election results from the backend.
        </p>
      </div>

      {message.text ? (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      ) : null}

      {loading ? (
        <section className="auth-panel p-4 text-secondary">Loading results...</section>
      ) : (
        <div className="d-grid gap-4">
          <section className="row g-3">
            <div className="col-md-4">
              <div className="status-panel p-4 h-100">
                <div className="text-secondary small">Total votes</div>
                <div className="display-6 fw-bold">{results.totalVotes}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="status-panel p-4 h-100">
                <div className="text-secondary small">Candidates</div>
                <div className="display-6 fw-bold">{results.candidates.length}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="status-panel p-4 h-100">
                <div className="text-secondary small">States</div>
                <div className="display-6 fw-bold">{results.stateWiseResults.length}</div>
              </div>
            </div>
          </section>

          <section className="row g-4">
            <div className="col-lg-7">
              <div className="auth-panel p-4 h-100">
                <h2 className="h5 fw-semibold mb-3">Candidate votes</h2>
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={topCandidates}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="voteCount" name="Votes" fill="#0d6efd" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="auth-panel p-4 h-100">
                <h2 className="h5 fw-semibold mb-3">State-wise turnout</h2>
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie data={stateChartData} dataKey="votes" nameKey="state" outerRadius={110} label>
                        {stateChartData.map((entry, index) => (
                          <Cell key={entry.state} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          <section className="auth-panel p-4">
            <h2 className="h5 fw-semibold mb-3">Detailed results</h2>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Party</th>
                    <th>State</th>
                    <th className="text-end">Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {results.candidates.map((candidate) => (
                    <tr key={candidate._id}>
                      <td className="fw-semibold">{candidate.name}</td>
                      <td>{candidate.party}</td>
                      <td>{candidate.state}</td>
                      <td className="text-end">{candidate.voteCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default Results;
