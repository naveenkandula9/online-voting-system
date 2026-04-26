import { Link, NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('votingToken');

  const handleLogout = () => {
    localStorage.removeItem('votingToken');
    localStorage.removeItem('votingUser');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-primary">
      <div className="container">
        <Link className="navbar-brand fw-semibold" to="/">
          Online Voting System
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <NavLink className="nav-link" to="/vote">
              Vote
            </NavLink>
            <NavLink className="nav-link" to="/results">
              Results
            </NavLink>
            <NavLink className="nav-link" to="/complaint">
              Complaint
            </NavLink>
            <NavLink className="nav-link" to="/admin">
              Admin
            </NavLink>
            {token ? (
              <button className="btn btn-outline-light btn-sm ms-lg-2" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <>
                <NavLink className="nav-link" to="/login">
                  Login
                </NavLink>
                <NavLink className="btn btn-primary btn-sm ms-lg-2" to="/register">
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
