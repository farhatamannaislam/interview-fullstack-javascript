import { useState } from 'react';
import './App.css';

type City = {
  id: number;
  name: string;
  count: number;
  isEditing?: boolean;
  editName?: string;
  editCount?: number;
};

function App() {
  const [search, setSearch] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newCount, setNewCount] = useState<number>(0);

  const fetchCities = async () => {
    if (!search.trim()) {
      setCities([]);
      setError(null); // Clear any previous error when input is empty
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:8000/api/cities?search=${encodeURIComponent(search)}&page=1`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setCities(data.results);

      // Handle empty result
      if (data.results.length === 0) {
        setError('No cities found. Try a different search term.');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to fetch cities. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchCities();
  };

  const handleAddCity = async () => {
    if (!newName.trim() || isNaN(Number(newCount)) || Number(newCount) <= 0) {
      setError('Please provide a valid name and count.');
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, count: newCount }),
      });

      if (res.status === 409) {
        setError('This city already exists. Please choose a different name.');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to add city');
      }

      setNewName('');
      setNewCount(0);
      setError(null); // clear previous errors
      fetchCities();
    } catch (err) {
      console.error('Add city failed:', err);
      setError('Failed to add city. Please try again.');
    }
  };


  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/api/cities/${id}`, {
        method: 'DELETE',
      });
      setError(null); // clear previous error
      fetchCities();  // refresh the list
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete city.');
    }
  };


  return (
    <div className="container">
      <h1 className="title">City Search</h1>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-group">
          <input
            type="text"
            placeholder="Enter city name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            aria-label="City search input"
          />
          <button
            type="submit"
            className="search-button"
            disabled={loading || !search.trim()}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      <div className="add-form">
        <h2>Add a New City</h2>
        <div className="search-group">
          <input
            type="text"
            placeholder="City name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="search-input"
          />
          <input
            type="number"
            placeholder="Count"
            value={newCount}
            onChange={(e) => setNewCount(Number(e.target.value))}
            className="search-input"
          />
          <button onClick={handleAddCity} className="search-button">
            Add City
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {cities.length > 0 && (
        <div className="results-container">
          <h2 className="results-title">Search Results</h2>
          <ul className="city-list">
            {cities.map((city) => (
              <li key={city.id} className="city-item">
                <span className="city-name">{city.name}</span>
                <span className="city-count">Count: {city.count.toLocaleString()}</span>
                <button onClick={() => handleDelete(city.id)} className="delete-button">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
