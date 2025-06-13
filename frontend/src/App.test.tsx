import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mocks fetch
beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => ({
      results: [{ id: 1, name: 'Berlin', count: 523 }],
      page: 1,
    }),
  });
});

test('renders "City Search" heading', () => {
  render(<App />);
  const heading = screen.getByText(/City Search/i);
  expect(heading).toBeInTheDocument();
});

test('search input accepts text', () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/enter city name/i);
  fireEvent.change(input, { target: { value: 'berlin' } });
  expect((input as HTMLInputElement).value).toBe('berlin');
});

test('displays search result after typing and clicking "Search"', async () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/enter city name/i);
  const button = screen.getByRole('button', { name: /search/i });

  fireEvent.change(input, { target: { value: 'Berlin' } });
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText(/Berlin/)).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Count') && content.includes('523'))).toBeInTheDocument();
  });
});

test('shows error if fetch fails', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
  });

  render(<App />);
  const input = screen.getByPlaceholderText(/enter city name/i);
  const button = screen.getByRole('button', { name: /search/i });

  fireEvent.change(input, { target: { value: 'ErrorCity' } });
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText(/Failed to fetch cities/i)).toBeInTheDocument();
  });
});





