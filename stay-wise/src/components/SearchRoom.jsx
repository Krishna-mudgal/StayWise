import { useNavigate,useSearchParams} from "react-router-dom";
import { useState,useEffect} from "react";

function SearchRooms(){
    const [rooms,setRooms]=useState([]);
    const [loading,setLoading]=useState(true);
    const [navbarSearch, setNavbarSearch] = useState('');
    const [navbarSuggestions, setNavbarSuggestions] = useState([]);
    const [searchParams] = useSearchParams();
    const locationParam = searchParams.get("location");
    
    const handleChange = (e)=>{
      const {name,value}=e.target;
      setReq(prev=>({...prev,[name]: value}));       
    }
    
    const handleNavbarSuggestionClick = (location) => {
      setNavbarSearch(location);
      setNavbarSuggestions([]);
      navigate(`/search?location=${encodeURIComponent(location)}`);
    };
    
        useEffect(() => {
            const fetchNavbarSuggestions = async () => {
              if (navbarSearch.trim() === '') {
                setNavbarSuggestions([]);
                return;
              }
      
              try {
                const res = await fetch(`http://localhost:4000/api/locations?q=${navbarSearch}`);
                const data = await res.json();
                console.log("🔍 Location suggestions from backend:", data);
                setNavbarSuggestions(data);
              } catch (err) {
                setLoading(false);
                console.error('Error fetching navbar locations:', err);
              }
            };
      
            const timeoutId = setTimeout(fetchNavbarSuggestions, 300); // debounce
            return () => clearTimeout(timeoutId);
          }, [navbarSearch]);


    useEffect(()=>{
      async function fetchProperties(){
        try{
          let url='http://localhost:4000/api/properties/all';

          if (locationParam) {
            url = `http://localhost:4000/api/search?location=${encodeURIComponent(locationParam)}`;
          }

          const res = await fetch(url);
          const data = await res.json();

          if (Array.isArray(data)) {
            setRooms(data);
          } else {
            console.error("Expected array but got:", data);
            setRooms([]);
          }
          setLoading(false);
        }catch(error){
          console.error("Error Occured",error);
        }
      }
      fetchProperties();
    },[locationParam])

    const activeRooms=rooms.filter((room)=>room.toLet==='Yes')
    const [one,setOne]=useState(false);
    const [curr,setCurr]=useState(0);
    const navigate=useNavigate();

    const getFrontImageUrl = (property) => {
      const front = property.photos?.find(p => p.label === "Property Front View");
      return front?.base64 || null;
    };
    
    const handleEvent=(curr)=>{
        setCurr(curr);
        setOne(!one);
    }

    const gotoprof=()=>{
        navigate('/profile')
    }

    const handleClick = (e,index)=>{
        alert("Request Sent")
      navigate('/home');
    }

    const handleHome =()=>{
      navigate('/home')
    }

    const gotohome=()=>{
        navigate('/home');
    }

    return (
    <div className="home-page">
      <nav className="navbar">
        <h2 className="staywise" onClick={handleHome}>StayWise</h2>
        <div style={{ position: 'relative', width: '250px' }}>
              <input
                type="text"
                placeholder="Search location..."
                value={navbarSearch}
                onChange={(e) => setNavbarSearch(e.target.value)}
                className="search-input"
                autoComplete="off"
              />

              {navbarSuggestions.length > 0 && (
                  <ul style={{
                    position: "absolute",
                    background: "white",
                    border: "1px solid #ccc",
                    zIndex: 20,
                    width: "100%",
                    maxHeight: "150px",
                    overflowY: "auto",
                    padding: 0,
                    margin: 0,
                    listStyle: "none"
                  }}>
                    {navbarSuggestions.map((loc, idx) => (
                      <li
                        key={idx}
                        onClick={() => handleNavbarSuggestionClick(loc)}
                        style={{ color:'#012525', padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                      >
                        {loc}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
        <div>
        <button className="profile-btn" onClick={gotohome}>Home</button>
        <button className="profile-btn" onClick={gotoprof}>Profile</button>
        </div>
      </nav>

      <div style={{display: "flex",placeItems: 'center',justifyContent: 'center',padding: "20px",marginTop:"25px",color:"#475569",fontSize:'larger'}} >
        <p>Rooms available at different location</p>
      </div>
     
        {locationParam && (
            <div className="showing">
                Showing results for: <strong>{locationParam}</strong>
            </div>
            )}

      {!one && <div className="prop-container">
        <div className="prop-box1">
          <h2 className="tx">All Properties:</h2>
          {loading?(
            <div className="loader-container"><div className="loader"></div></div>
          ) : (
            <div className="prop-collection">
              {activeRooms.length==0?(
                <div className="load">
                  No Property Created...
                </div>
              ):(activeRooms.map((room, index) => (
                <div className="room-nbox" key={room._id || index}>
                  <h2>Property {index + 1}</h2>
                  {getFrontImageUrl(room) ? (
                    <img src={getFrontImageUrl(room)} alt="Front View" className="photo" />
                  ) : (
                    <div className="photo placeholder">No Image</div>
                  )}
                  <p><strong>Location:</strong> {room.location?.city}</p>
                  <p><strong>Total Area:</strong> {room.totalArea}</p>
                  <p><strong>Type:</strong> {room.propertyType}</p>
                  <p><strong>Rental Status:</strong> {room.toLet === "Yes" ? "✅ To-Let" : "❌ Not To-Let"}</p>

                  <button onClick={() => navigate(`/customer/view/${room._id}`)}>View</button>
                </div>
              )))}
            </div>
          )}
        </div>
      </div>}

      <div>
        
      {one && activeRooms.length>0?(
            <div>
                <h1>ROOM SELECTED HERE {curr+1}</h1>
                <div className="decision-box">Room no. {curr+1}</div>
                <div className="details">
                    <h2>Details about the selected room</h2>
                    <h2><strong>Location :</strong>{activeRooms[curr].location}</h2>
                    <p><strong>Range :</strong>{activeRooms[curr].range}</p>
                    <p><strong>Duration :</strong>{activeRooms[curr].duration}</p>
                    <p><strong>Category :</strong>{activeRooms[curr].category}</p>
                    <button onClick={handleClick}>Send Message</button>
                </div>
            </div>):(<p></p>)}
        </div>
    </div>
  );
}

export default SearchRooms;