import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <main className="container py-5">
      <section className="row align-items-center g-4 py-lg-4">
        <div className="col-lg-7">
          <p className="text-primary fw-semibold mb-2">Distributed MERN Voting Platform</p>
          <h1 className="display-5 fw-bold mb-3">Secure digital elections for registered voters</h1>
          <p className="lead text-secondary mb-4">
            Register with OTP and Aadhaar validation, sign in with JWT authentication, vote once,
            and watch results update from the backend.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-primary btn-lg" to="/register">
              Register
            </Link>
            <Link className="btn btn-outline-dark btn-lg" to="/results">
              View Results
            </Link>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="status-panel p-4">
            <h2 className="h5 fw-semibold mb-3">Frontend foundation</h2>
            <div className="d-grid gap-3">
              <div>
                <span className="badge text-bg-success mb-2">Ready</span>
                <p className="mb-0 text-secondary">React routing and API client configured.</p>
              </div>
              <div>
                <span className="badge text-bg-info mb-2">Next</span>
                <p className="mb-0 text-secondary">Build Register page with OTP verification.</p>
              </div>
              <div>
                <span className="badge text-bg-dark mb-2">Backend</span>
                <p className="mb-0 text-secondary">Expected API base: http://localhost:5000</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
