import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import './App.css';

const API = "http://localhost:4000/api";
const getToken = () => localStorage.getItem("token");

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = data.error || 'Something went wrong';
    throw new Error(error);
  }
  return data;
};

// ---------------- Login ----------------
function Login() {
  const [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function login(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await handleResponse(res);
      localStorage.setItem("token", data.token);
      navigate("/");
      window.location.reload(); // Force a refresh to update the navbar
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="auth-container">
      <form onSubmit={login} className="auth-form">
        <h2>Login</h2>
        <input 
          className="form-input"
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
        />
        <input 
          className="form-input"
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        />
        <button type="submit" className="btn btn-primary">Login</button>
        <p>New user? <Link to="/register" className="auth-link">Register</Link></p>
      </form>
    </div>
  );
}

// ---------------- Register ----------------
function Register() {
  const [name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState("");
  const navigate=useNavigate();
  async function register(e){
    e.preventDefault();
    try {
      const res=await fetch(`${API}/register`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name,email,password})
      });
      const data=await handleResponse(res);
      localStorage.setItem("token",data.token);
      navigate("/");
    }catch(err){alert(err.message);}
  }
  return(
    <div className="auth-container">
      <form onSubmit={register} className="auth-form">
        <h2>Register</h2>
        <input 
          className="form-input"
          placeholder="Name" 
          value={name} 
          onChange={e => setName(e.target.value)} 
        />
        <input 
          className="form-input"
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
        />
        <input 
          className="form-input"
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        />
        <button type="submit" className="btn btn-primary">Register</button>
        <p>Already have an account? <Link to="/login" className="auth-link">Login</Link></p>
      </form>
    </div>
  );
}

// ---------------- Movies ----------------
function Movies(){
  const [movies,setMovies]=useState([]);
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${API}/movies`, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);
  return(
    <div className="main-content">
      <h2>Now Showing</h2>
      <div className="movies-grid">
        {movies.map(movie => (
          <div key={movie.id} className="movie-card">
            <h3>{movie.title}</h3>
            <p className="movie-description">{movie.description}</p>
            <Link to={`/movie/${movie.id}/showtimes`} className="btn">View Showtimes</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Showtimes ----------------
function MovieShowtimes() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const movieRes = await fetch(`${API}/movies/${id}`,{headers:{Authorization:`Bearer ${getToken()}`}});
        const movieData = await movieRes.json();
        setMovie(movieData);

        const showtimesRes = await fetch(`${API}/movies/${id}/showtimes`,{headers:{Authorization:`Bearer ${getToken()}`}});
        const showtimesData = await showtimesRes.json();
        setShows(showtimesData);
      } catch (err) {
        console.error("Error fetching showtimes:", err);
      }
    })();
  }, [id]);

  if (!movie) return <div className="loading">Loading...</div>;

  return (
    <div className="main-content showtimes-container">
      <h2>{movie.title} - Showtimes</h2>
      <p className="movie-description">{movie.description}</p>

      <div className="showtimes-grid">
        {shows.length > 0 ? (
          shows.map((show) => (
            <div key={show.id} className="showtime-card">
              {/* Just display the plain time string instead of parsing as a Date */}
              <h4>Showtime: {show.time}</h4>
              <Link to={`/book/${show.id}`} className="btn">
                Book Now
              </Link>
            </div>
          ))
        ) : (
          <p>No showtimes available for this movie.</p>
        )}
      </div>
    </div>
  );
}


// ---------------- Booking ----------------
function Booking(){
  const {id}=useParams();
  const [seats,setSeats]=useState([]),[selected,setSelected]=useState([]);
  const navigate=useNavigate();

  useEffect(()=>{
    if(!getToken()){navigate("/login");return;}
    fetch(`${API}/showtimes/${id}/seats`,{headers:{Authorization:`Bearer ${getToken()}`}})
      .then(r=>r.json())
      .then(data => {
        if (!Array.isArray(data)) return [];
        // Sort seats by row (A, B, C, etc.) and then by seat number (1, 2, 3, etc.)
        return [...data].sort((a, b) => {
          // Extract row letter and seat number using regex
          const matchA = a.seat_number.match(/^([A-Za-z]+)(\d+)$/);
          const matchB = b.seat_number.match(/^([A-Za-z]+)(\d+)$/);
          
          if (!matchA || !matchB) return 0; // Handle unexpected format
          
          const [, rowA, numA] = matchA;
          const [, rowB, numB] = matchB;
          
          // First compare rows (A, B, C, etc.)
          if (rowA < rowB) return -1;
          if (rowA > rowB) return 1;
          
          // If same row, compare seat numbers
          return parseInt(numA, 10) - parseInt(numB, 10);
        });
      })
      .then(sortedSeats => setSeats(sortedSeats || []));
  },[id,navigate]);

  const toggle=(seat)=>{
    setSelected(prev=>prev.includes(seat)?prev.filter(s=>s!==seat):[...prev,seat]);
  }

  async function confirm(){
    try{
      const res=await fetch(`${API}/book`,{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${getToken()}`},
        body:JSON.stringify({showtime_id:id,seats:selected})
      });
      const data=await handleResponse(res);
      alert(data.message);
      navigate("/mybookings");
    }catch(err){alert(err.message);}
  }

  return (
    <div className="main-content booking-container">
      <h2>Select Seats</h2>
      <div className="screen">Screen</div>
      <div className="seats-grid">
        {seats.map(seat => (
          <button
            key={seat.id}
            className={`seat-btn ${!seat.available ? 'unavailable' : ''} ${selected.includes(seat.seat_number) ? 'selected' : ''}`}
            disabled={!seat.available}
            onClick={() => toggle(seat.seat_number)}
          >
            {seat.seat_number}
          </button>
        ))}
      </div>
      
      <div className="booking-summary">
        <div className="legend">
          <div className="legend-item">
            <div className="seat-available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="seat-selected"></div>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <div className="seat-unavailable"></div>
            <span>Booked</span>
          </div>
        </div>
        
        <div className="selected-seats">
          <h4>Selected Seats: {selected.length > 0 ? selected.join(", ") : "None"}</h4>
          <p>Total Price: ₹{selected.length * 120} (₹{120} per seat)</p>
        </div>
        
        <button 
          onClick={confirm} 
          className="btn confirm-btn"
          disabled={!selected.length}
        >
          Confirm Booking ({selected.length} {selected.length === 1 ? 'ticket' : 'tickets'})
        </button>
      </div>
    </div>
  );
}

// ---------------- MyBookings ----------------
function MyBookings(){
  const [data,setData]=useState([]);
  const navigate=useNavigate();
  useEffect(()=>{
    if(!getToken()){navigate("/login");return;}
    fetch(`${API}/mybookings`,{headers:{Authorization:`Bearer ${getToken()}`}})
      .then(r=>r.json()).then(setData);
  },[navigate]);
  return (
    <div className="main-content bookings-container">
      <h2>My Bookings</h2>
      {data.length > 0 ? (
        <div className="bookings-list">
          {data.map(booking => (
            <div key={booking.id} className="booking-card">
              <h3>{booking.movie_title}</h3>
              {/* <p><strong>Showtime ID:</strong> {booking.showtime_id}</p> */}
              <p><strong>Seats:</strong> {booking.seats}</p>
              <p><strong>Total Paid:</strong> ₹{booking.total}</p>
              <p><strong>Booking ID:</strong> {booking.id}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-bookings">
          <p>You don't have any bookings yet.</p>
          <Link to="/" className="btn">Browse Movies</Link>
        </div>
      )}
    </div>
  );
}

// ---------------- Navbar + Routes ----------------
function NavBar(){
  const nav = useNavigate();
  const isLoggedIn = getToken();
  
  const logout = () => {
    localStorage.removeItem("token");
    nav("/login");
  };
  
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" className="logo">MovieTix</Link>
      </div>
      <div className="nav-links">
        {isLoggedIn && (
          <>
            <Link to="/" className="nav-link">Movies</Link>
            <Link to="/mybookings" className="nav-link">My Bookings</Link>
            <button onClick={logout} className="btn btn-outline">Logout</button>
          </>
        )}
        {!isLoggedIn && (
          <Link to="/login" className="btn btn-primary">Login / Register</Link>
        )}
      </div>
    </nav>
  );
}

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!getToken()) {
      navigate('/login');
    }
  }, [navigate]);

  return getToken() ? children : null;
};

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Movies />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/movie/:id/showtimes" 
              element={
                <ProtectedRoute>
                  <MovieShowtimes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/book/:id" 
              element={
                <ProtectedRoute>
                  <Booking />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mybookings" 
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <footer className="footer">
          <p>© {new Date().getFullYear()} MovieTix - Book your movie tickets online</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;