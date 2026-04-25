import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../services/api';

const Vote = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('votingUser') || '{}');
    } catch (_error) {
      return {};
    }
  }, []);

  const userState = user.state || '';
  const [hasVoted, setHasVoted] = useState(Boolean(user.hasVoted));

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => candidate.state === user.state);
  }, [candidates, user.state]);

  const getPartySymbol = (candidate) => {
    return candidate.partySymbol || '/images/jsp-party.jpg';
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!userState) {
        setCandidates([]);
        setMessage({
          type: 'warning',
          text: 'Your account has no state saved. Register with a state before voting.',
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setMessage({ type: '', text: '' });

        const response = await api.get('/api/candidates', {
          params: userState ? { state: userState } : {},
        });

        const nextCandidates = response.data.candidates || [];
        setCandidates(nextCandidates);

        if (!nextCandidates.length) {
          setMessage({
            type: 'warning',
            text: `No candidates found for ${userState}.`,
          });
        }
      } catch (error) {
        setMessage({ type: 'danger', text: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [userState]);

  const handleVote = async (candidateId = selectedCandidateId) => {
    if (!candidateId) {
      setMessage({ type: 'danger', text: 'Please select a candidate before voting.' });
      return;
    }

    try {
      setVoting(true);
      setMessage({ type: '', text: '' });

      await api.post('/api/vote', {
        candidateId,
      });

      const updatedUser = {
        ...user,
        hasVoted: true,
      };

      localStorage.setItem('votingUser', JSON.stringify(updatedUser));
      setHasVoted(true);
      setCandidates((current) =>
        current.map((candidate) =>
          candidate._id === candidateId ? { ...candidate, voteCount: candidate.voteCount + 1 } : candidate,
        ),
      );
      setMessage({ type: 'success', text: 'Your vote has been cast successfully.' });
    } catch (error) {
      setMessage({ type: 'danger', text: error.message });
    } finally {
      setVoting(false);
    }
  };

  return (
    <main className="container py-5">
      <div className="page-header mb-4">
        <p className="text-primary fw-semibold mb-1">Secure Ballot</p>
        <h1 className="h2 fw-bold">Cast your vote</h1>
        <p className="text-secondary mb-0">
          Select one candidate from your registered state. You can vote only once.
        </p>
      </div>

      {message.text ? (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      ) : null}

      <div className="row g-4">
        <div className="col-lg-8">
          <section className="auth-panel p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
              <div>
                <h2 className="h5 fw-semibold mb-1">Candidates</h2>
                <p className="text-secondary mb-0">
                  {userState ? `Showing candidates for ${userState}.` : 'State not found on your profile.'}
                </p>
              </div>
              {hasVoted ? <span className="badge text-bg-success align-self-start">Already voted</span> : null}
            </div>

            {loading ? (
              <div className="text-secondary py-4">Loading candidates...</div>
            ) : (
              <div className="candidate-grid">
                {filteredCandidates.map((candidate) => (
                  <article
                    className={`candidate-card ${selectedCandidateId === candidate._id ? 'selected' : ''}`}
                    key={candidate._id}
                    onClick={() => setSelectedCandidateId(candidate._id)}
                  >
                    <input
                      checked={selectedCandidateId === candidate._id}
                      className="candidate-radio"
                      disabled={hasVoted || voting}
                      id={`candidate-${candidate._id}`}
                      name="candidate"
                      onChange={() => setSelectedCandidateId(candidate._id)}
                      type="radio"
                    />
                    <label className="candidate-card-body" htmlFor={`candidate-${candidate._id}`}>
                      <img
                        alt={`${candidate.party} party symbol`}
                        className="party-symbol"
                        src={getPartySymbol(candidate)}
                      />
                      <span className="candidate-name">{candidate.name}</span>
                      <span className="candidate-party">{candidate.party}</span>
                      <span className="candidate-state">{candidate.state}</span>
                    </label>
                    <button
                      className="btn btn-primary w-100"
                      disabled={loading || voting || hasVoted}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedCandidateId(candidate._id);
                        handleVote(candidate._id);
                      }}
                      type="button"
                    >
                      {voting && selectedCandidateId === candidate._id ? 'Submitting...' : 'Vote'}
                    </button>
                  </article>
                ))}
              </div>
            )}

            <div className="d-grid d-sm-flex gap-2 mt-4">
              <Link className="btn btn-outline-dark btn-lg" to="/results">
                View Results
              </Link>
            </div>
          </section>
        </div>

        <div className="col-lg-4">
          <aside className="status-panel p-4">
            <h2 className="h5 fw-semibold mb-3">Voter status</h2>
            <div className="d-grid gap-3">
              <div>
                <div className="text-secondary small">Name</div>
                <div className="fw-semibold">{user.name || 'Logged in voter'}</div>
              </div>
              <div>
                <div className="text-secondary small">Voting State</div>
                <div className="fw-semibold">{userState || 'Not available'}</div>
              </div>
              <div>
                <div className="text-secondary small">Vote status</div>
                <div className={`fw-semibold ${hasVoted ? 'text-success' : 'text-primary'}`}>
                  {hasVoted ? 'Vote recorded' : 'Eligible to vote'}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Vote;
