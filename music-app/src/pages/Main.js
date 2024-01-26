import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/main.css';
import { useSelector, useDispatch } from 'react-redux';
import { setId } from '../state/actions/setId';
import { setAccessToken } from '../state/actions/setAccessToken';
import Song from '../components/Song';
import profile from '../images/profile-pic.jpg';
import SongResult from '../components/SongResult';
import Logo from '../components/Logo';


function Main() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [songResults, setSongResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logoutClicked, setLogoutClicked] = useState(false);
  
  const userId = useSelector((state) => state.userId);
  const access_token = useSelector((state) => state.access_token);

  const songResultsContainerRef = useRef(null);

  const dispatch = useDispatch();

  // EFFECTS ------------------------------------------------------------------

  // useEffect hook for the search bar 
  useEffect(() => {
    searchForSongs(searchTerm);
  }, [searchTerm]);
  

  // useEffect hook for grabbing user data from DB. 
  useEffect(() => {
    const grabInfo = async () => {
      if (token === null) {
        navigate('/login'); 
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/check/' + userId, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          navigate('/login'); // Use navigate directly to navigate
        }
      } catch (error) {
        console.log(error);
      }
    };

    grabInfo();
  }, [userId, token, navigate, access_token]); 

  // useEffect to manage the auto scroll to the bottom.
  useEffect(() => {
    // Scroll to the bottom of the song results container
    if (songResultsContainerRef.current) {
      songResultsContainerRef.current.lastChild.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [songResults]);
  
  // Use useEffect to add and remove the loading class on the body element
  useEffect(() => {
    if (loading) {
      document.body.classList.add('loading-cursor');
    } else {
      document.body.classList.remove('loading-cursor');
    }

    // Cleanup function to remove the loading class when the component unmounts
    return () => {
      document.body.classList.remove('loading-cursor');
    };
  }, [loading]);

  // useEffect for the logout button.
  useEffect(() => {
  }, [logoutClicked])

  //  ----------------------------------------------------------------------

  // functions

  function toggleLogout() {
    setLogoutClicked(!logoutClicked);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    dispatch(setId(null));
    dispatch(setAccessToken(null));
    window.location.reload();
  }

  const searchForSongs = async (term) => {
    if (term === "") {
      setSearchResults([]);
      return;
    }
    
    term = encodeURIComponent(term);

    try {
      // Accessing Spotify API to search for songs 
      const response = await fetch(`https://api.spotify.com/v1/search?q=${term}&type=track&limit=5`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (response.ok) {
        setSearchResults([]);
        const data = await response.json();
        const result = data.tracks.items;
        setSearchResults(result);
      } else {
        console.error('Error searching for songs:', response.status, response.statusText);
        handleLogout();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // SEND ID FUNCTION, OUR MONEY FUNCTION
  async function sendID(id) {
    setLoading(true); // Set loading to true when starting the API call
    setSearchResults('')
    try {
        const response = await fetch(`http://127.0.0.1:5000/recommend?track_id=${id}`, {
            method: 'GET',
        });

        if (!response.ok) {
            console.error('Request failed with status:', response.status);
            return;
        }

        const responseText = await response.text();
        const safeText = responseText.replace(/NaN/g, "null");
        if (safeText.trim() === '') {
            console.log('No recommendations found.');
            return;
        }
        const data = JSON.parse(safeText);
        setSongResults(data);

    } catch (err) {
        console.error('Error:', err);
    } finally {
      setLoading(false); 
    }
  }
  // -----------------------------------

  return (
      <div 
        className="main-background" 
      >
        <div className="navbar">
          <Logo white={true}></Logo>
          <div className="logout-container">
            <img src={profile} alt="profile" onClick={toggleLogout} className='profile'></img>
            <button 
              style={logoutClicked ? {visibility: "visible"} : {visibility: "hidden"}}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div> 
        </div>
        <p className="welcome-text"> Welcome, {user ? user.username : ''}. Ready to find more songs?</p>
        <div className="search-bar-container"> {/* Without this, it keeps shrinking */} 
            <input 
                type="text" 
                className="search-bar" 
                placeholder="Enter a song title or artist..."
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className='results-container'>

          {searchResults[1] && 
          <div className="possible-results">
            {searchResults.map((song) => (
              <Song 
                key={song.id}
                id={song.id} 
                name={song.name} 
                imageURL={song.album.images[0].url} 
                artist={song.artists[0].name}
                onClick={sendID}
              > 
              </Song>

            ))}
          </div> }

          {songResults[1] && 
          <>
            <div class="rec-container">
              <p className='recommendation-text'>Here are your recommendations:</p>
            </div>
            <div className='song-results-container' ref={songResultsContainerRef}>
              {songResults.map((song) => (
                <SongResult 
                  artist={song.artists} 
                  name={song.track_name} 
                  key={song.id}
                  image_url={song.image_url}
                  preview_url={song.preview_url}>
                </SongResult>
              ))}
            </div> 
          </>
          }
        </div>
      </div>
    
  );
}

export default Main;
