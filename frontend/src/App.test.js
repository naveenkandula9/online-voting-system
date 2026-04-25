import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const brandElement = screen.getByText(/online voting system/i);
  expect(brandElement).toBeInTheDocument();
});
