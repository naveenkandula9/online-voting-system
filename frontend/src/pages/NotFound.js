import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <main className="container py-5 text-center">
      <h1 className="h2 fw-bold">Page not found</h1>
      <p className="text-secondary">The page you are looking for does not exist.</p>
      <Link className="btn btn-primary" to="/">
        Go Home
      </Link>
    </main>
  );
};

export default NotFound;
