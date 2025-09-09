import { useEffect, useState, useRef } from 'react';

const API_URL = 'http://localhost:3001/movies';

function App() {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({
    title: '',
    director: '',
    genre: '',
    release_year: '',
    rating: '',
    image_url: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef(null);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setMovies(data);
    } catch (err) {
      setError('Failed to fetch movies');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to save movie');
      setForm({ title: '', director: '', genre: '', release_year: '', rating: '', image_url: '' });
      setEditingId(null);
      fetchMovies();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (movie) => {
    setForm({
      title: movie.title || '',
      director: movie.director || '',
      genre: movie.genre || '',
      release_year: movie.release_year ? String(movie.release_year) : '',
      rating: movie.rating ? String(movie.rating) : '',
      image_url: movie.image_url || ''
    });
    setEditingId(movie.id);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this movie?')) return;
    setError('');
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete movie');
      fetchMovies();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-200 via-pink-200 to-purple-200 p-4 relative">
      <div ref={formRef}></div>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-pink-700 tracking-tight">🎬 Movies Collection</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 bg-teal-50 p-6 rounded-xl shadow">
          <input className="border p-2 rounded focus:ring-2 focus:ring-pink-400" name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
          <input className="border p-2 rounded focus:ring-2 focus:ring-pink-400" name="director" value={form.director} onChange={handleChange} placeholder="Director" required />
          <input className="border p-2 rounded focus:ring-2 focus:ring-pink-400" name="genre" value={form.genre} onChange={handleChange} placeholder="Genre" required />
          <input className="border p-2 rounded focus:ring-2 focus:ring-pink-400" name="release_year" value={form.release_year} onChange={handleChange} placeholder="Release Year" type="number" required />
          <input className="border p-2 rounded focus:ring-2 focus:ring-pink-400" name="rating" value={form.rating} onChange={handleChange} placeholder="Rating" type="number" step="0.1" required />
          <input className="border p-2 rounded focus:ring-2 focus:ring-pink-400" name="image_url" value={form.image_url} onChange={handleChange} placeholder="Image URL" />
          <button className="bg-gradient-to-r from-pink-500 to-teal-500 text-white rounded p-2 col-span-1 md:col-span-3 hover:from-pink-600 hover:to-teal-600 transition font-semibold shadow" type="submit">
            {editingId ? 'Update Movie' : 'Add Movie'}
          </button>
        </form>
        {loading ? (
          <div className="text-center text-teal-700">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <div key={movie.id} className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center hover:shadow-xl transition">
                <div className="w-32 h-48 mb-3 flex items-center justify-center bg-teal-100 rounded overflow-hidden">
                  {movie.image_url ? (
                    <img src={movie.image_url} alt={movie.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
                <div className="w-full">
                  <h2 className="text-lg font-bold text-pink-700 mb-1 text-center">{movie.title}</h2>
                  <div className="text-sm text-teal-700 mb-1 text-center">{movie.director}</div>
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>{movie.genre}</span>
                    <span>{movie.release_year}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs font-semibold">⭐ {movie.rating}</span>
                    <div>
                      <button className="bg-yellow-400 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-500 text-xs font-bold" onClick={() => handleEdit(movie)}>
                        Edit
                      </button>
                      <button className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs font-bold" onClick={() => handleDelete(movie.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
