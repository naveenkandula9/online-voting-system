import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <main className="container py-5">
      <section className="row align-items-center g-4 py-lg-4">
        <div className="col-lg-7">
          <p className="text-primary fw-semibold mb-2">Voting Platform</p>
          <h1 className="display-5 fw-bold mb-3">Secure digital elections for registered voters</h1>
          
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-primary btn-lg" to="/register">
              Register
            </Link>
            <Link className="btn btn-outline-dark btn-lg" to="/results">
              View Results
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;