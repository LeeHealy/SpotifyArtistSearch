import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, InputGroup, FormControl, Row, Card, Navbar} from 'react-bootstrap'
import { useState, useEffect } from 'react';

function App() {
  const [searchInput, setSearchInput] = useState('');
  const [prevSearchInput, setPrevSearchInput] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [albums, setAlbums] = useState([]);
  const [artist, setArtist] = useState('');
  const [artistImage, setArtistImage] = useState('');
  const [noData, setNoData] = useState(false);
 
  useEffect(() => {
    const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
    const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;
    // API Access Token
    var authParams = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
    };
    fetch('https://accounts.spotify.com/api/token', authParams)
    .then((result) => result.json())
    .then(data => {
      setAccessToken(data.access_token);
    });
  }, []);

  // Search
  async function search() {  
    if(searchInput === prevSearchInput) {
      return;
    }
    if(searchInput === '') {
      setAlbums([]);
      setArtist('');
      setPrevSearchInput('');
    } else {
      setArtist('');
      setAlbums([]);
      setPrevSearchInput(searchInput);
      // GET request using search to get Artist ID
      var searchParams = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }
      }
      var artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParams)
      .then(response => response.json())
      .then(data => {
        if(data.artists.items.length !== 0) {
          setNoData(false);
          return data.artists.items[0].id;
        } else {
         setNoData(true);
      }})
      // GET request using Artist ID to get artist albums
      var returnedAlbums = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?include_groups=album&market=US&limit=50', searchParams)
      .then(response => response.json())
      .then(data => {
        let name = '';
        let albumsFetched = data.items;
        let albumsNonDuplicated = [];
        albumsFetched.forEach(element => {
          if(element.name !== name) {
            albumsNonDuplicated.push(element);
            name = element.name;
          }
        });
        setAlbums(albumsNonDuplicated);
      });
      // Artist Info with Artist ID
      var artistInfo = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/', searchParams)
      .then(response => response.json())
      .then(data => {
        setArtist(data);
        setArtistImage(data.images[1].url);
      })
    }
  }
  return (
    <div className="App" id='body'>
      <Navbar>
      <div id='navbar'>
            <div id='left-side'>
                <a href="/">
                    <img id='spotify-icon' alt='Spotify Icon Logo' src='/spotify-icon.png' width={38} height={38}/>
                </a>
                <h2 id='navbar-text'>Spotify Artist Search</h2>
            </div>
        </div>
      </Navbar>
      <Container id='container1'>
        <InputGroup className='mb-4' id='input-group' size='lg'>
          <FormControl
            placeholder='Search For Artist'
            type='input'
            onKeyPress={event => {
              if(event.key === 'Enter') {
                search();
              }
            }}
            onChange={event => {setSearchInput(event.target.value)}}
          />
          <button onClick={search} className="btn btn-outline-success" id='search-button'>
            Search
          </button>
        </InputGroup>
      </Container>
      <Container>
        {artist && !noData && 
          <div id='artist-info' className='fade-in'>
            <div id='artist-header' className='slide-in'>
              <div><h1>Artist: {artist.name}</h1></div>
              <div><h1>Genre: {artist.genres[0]}</h1></div>
              <div><h1>Followers: {Number(artist.followers.total).toLocaleString()}</h1></div>
              <div><h1>Popularity: {artist.popularity}</h1></div>
            </div>
            <div id='artist-header-img'>
                <img className='fade-in-img' src={artistImage}/>
            </div>
          </div>
        }
        {noData === true && 
          <div>
            <h1 className='noResult'>Sorry, no artist found.</h1>
          </div>
        }
      </Container>
      <Container id='album-rows'>
        <Row className='mx-2 row row-cols-4'>
          {albums.map( (album) => {
            return (
              <Card className='grow fade-in' key={album.id}>
                <Card.Img src={album.images[0].url}/>
                  <Card.Body>
                  <Card.Title>{album.name}</Card.Title>
                  <Card.Text className='hide'>Released: {album.release_date}</Card.Text>
                  </Card.Body>
              </Card>
            )})}
        </Row>
      </Container>
    </div>
  );
}

export default App;
