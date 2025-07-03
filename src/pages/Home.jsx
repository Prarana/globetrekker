import React, { useState } from "react";
import axios from "axios";
import { getAmadeusToken } from "../services/amadeus";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../services/firebase";


const Home = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [budget, setBudget] = useState(500);
  const [date, setDate] = useState("");
  const [results, setResults] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passengers, setPassengers] = useState(1);
  const { user } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
  };

  const fetchFlightOffers = async () => {
    setLoading(true);
    setError("");
    try {
      const accessToken = await getAmadeusToken();
      const response = await axios.get(
        "https://test.api.amadeus.com/v2/shopping/flight-offers",
        {
          params: {
            originLocationCode: from.toUpperCase(),
            destinationLocationCode: to.toUpperCase(),
            departureDate: date,
            adults: passengers,
            nonStop: false,
            max: 200,
            currencyCode: "USD",
            maxPrice: budget,
          },
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setResults(response.data.data);
    } catch (err) {
      console.error("Error fetching flights:", err);
      setError(
        "Could not fetch flight offers. Please check the airport codes and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to || !date) {
      setError("All fields are required.");
      return;
    }
    fetchFlightOffers();
  };

  const handleAddToTrip = (flight) => {
    setItinerary((prev) => [...prev, flight]);
  };

  const handleSaveItinerary = async () => {
    if (!user) {
      alert("No user is logged in. Please log in to save itinerary.");
      return;
    }
    if (!itinerary.length) return;
  
    try {
      const docRef = await addDoc(collection(db, "itineraries"), {
        uid: user.uid,
        createdAt: Timestamp.now(),
        flights: itinerary,
      });
  
      alert("🚀 Itinerary saved successfully with ID: " + docRef.id);
      setItinerary([]);
    } catch (error) {
      alert("Failed to save itinerary. Please try again.");
    }
  };


  return (
    <div style={styles.wrapper}>
      {/* Search Panel */}
      <form onSubmit={handleSubmit} style={styles.searchBox}>
        {/* Origin & Destination */}
        <div style={styles.sectionBox}>
          <div>
            <label style={styles.label}>ORIGIN</label>
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value.toUpperCase())}
              placeholder="e.g. HYD"
              style={styles.input}
              maxLength={3}
            />
          </div>

          <div
            style={styles.swapButton}
            onClick={() => {
              const temp = from;
              setFrom(to);
              setTo(temp);
            }}
          >
            ⇅
          </div>

          <div>
            <label style={styles.label}>DESTINATION</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value.toUpperCase())}
              placeholder="e.g. AUH"
              style={styles.input}
              maxLength={3}
            />
          </div>
        </div>

        {/* Departure Date */}
        <div style={styles.sectionBox}>
          <label style={styles.label}>DEPARTURE</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* Passengers */}
        <div style={styles.sectionBox}>
          <label style={styles.label}>PASSENGERS</label>
          <input
            type="number"
            value={passengers}
            onChange={(e) =>
              setPassengers(Math.max(1, parseInt(e.target.value || 1)))
            }
            min={1}
            style={styles.input}
          />
        </div>

        {/* Search Button */}
        <button type="submit" style={styles.button}>
          SEARCH
        </button>

        {error && <p style={styles.error}>{error}</p>}
        <button type="button" onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </form>

      {/* Results Panel */}
      <div style={styles.middle}>
        <h3 style={styles.panelHeading}>Flights</h3>
        {loading ? (
          <p style={styles.infoText}>Loading flights...</p>
        ) : results.length === 0 ? (
          <p style={styles.infoText}>No flight results.</p>
        ) : (
            results.map((flight, index) => {
                const offer = flight.itineraries[0];
                const segments = offer.segments;
                const dep = segments[0].departure;
                const arr = segments[segments.length - 1].arrival;
                const duration = offer.duration.replace("PT", "").toLowerCase();
                const stops = segments.length - 1;
                const stopCity = stops > 0 ? segments[0].arrival.iataCode : "Non-stop";
              
                return (
                  <div key={index} style={styles.flightCardModern}>
                    <div style={styles.flightDetails}>
                      <div style={styles.timeSection}>
                        <div style={styles.timeText}>{dep.at.slice(11, 16)} {/* HH:MM */}</div>
                        <div style={styles.codeText}>{dep.iataCode}</div>
                      </div>
              
                      <div style={styles.pathSection}>
                        <div style={styles.durationText}>{duration}</div>
                        <div style={styles.flightPath}>
                          <div style={styles.dot}></div>
                          <div style={styles.line}></div>
                          <div style={styles.arrow}>✈️</div>
                        </div>
                        <div style={styles.stopText}>
                          {stops > 0 ? `${stops} stop` : "Non-stop"}{" "}
                          {stops > 0 && <span>{stopCity}</span>}
                        </div>
                      </div>
              
                      <div style={styles.timeSection}>
                        <div style={styles.timeText}>
                          {arr.at.slice(11, 16)}
                          {arr.at.includes("+") && (
                            <sup style={{ marginLeft: 2, fontSize: "10px" }}>
                              +{arr.at.split("+")[1]}
                            </sup>
                          )}
                        </div>
                        <div style={styles.codeText}>{arr.iataCode}</div>
                      </div>
                    </div>
              
                    <div style={styles.priceSection}>
                      <div style={styles.priceText}>${flight.price.total}</div>
                      <button
                        onClick={() => handleAddToTrip(flight)}
                        style={styles.selectButton}
                      >
                        Select →
                      </button>
                    </div>
                  </div>
                );
              })
        )}
      </div>

      {/* Itinerary Panel */}
      <div style={styles.right}>
        <h3 style={styles.panelHeading}>Itinerary</h3>
        {itinerary.length === 0 ? (
          <p style={styles.infoText}>No flights added yet.</p>
        ) : (
          <ul style={styles.itineraryList}>
            {itinerary.map((flight, i) => {
              const segments = flight.itineraries[0].segments;
              return (
                <li key={i} style={styles.card}>
                  ✈️ {segments[0].departure.iataCode} →{" "}
                  {segments[segments.length - 1].arrival.iataCode}
                  <br />
                  💰 ${flight.price.total}
                </li>
              );
            })}
          </ul>
        )}
        {itinerary.length > 0 && (
          <button onClick={handleSaveItinerary} style={styles.button}>
            Save Itinerary
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    height: "100%",
    width:"100%",
    padding: "1.5rem",
    gap: "1.5rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(5px)",
  },

  searchBox: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontSize: "14px",
  },

  sectionBox: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.75rem",
  },

  label: {
    fontSize: "11px",
    color: "#666",
    marginBottom: "6px",
    display: "block",
    fontWeight: "600",
  },

  input: {
    padding: "8px 10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1.5px solid #ccc",
    width: "100%",
    fontWeight: "500",
    color: "#333",
    outline: "none",
    transition: "border-color 0.2s ease",
  },

  inputFocus: {
    borderColor: "#d0006f",
  },

  swapButton: {
    fontSize: "22px",
    cursor: "pointer",
    padding: "6px 12px",
    userSelect: "none",
    color: "#d0006f",
    alignSelf: "center",
    borderRadius: "8px",
    border: "1.5px solid transparent",
    transition: "background-color 0.2s ease",
  },

  swapButtonHover: {
    backgroundColor: "rgba(208, 0, 111, 0.1)",
    borderColor: "#d0006f",
  },

  button: {
    marginTop: "1rem",
    padding: "0.85rem",
    backgroundColor: "#d0006f", // magenta
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },

  buttonHover: {
    backgroundColor: "#b6005a",
  },

  logoutButton: {
    marginTop: "1.5rem",
    padding: "0.85rem",
    backgroundColor: "#d0006f", // magenta for consistency
    border: "none",
    color: "#fff",
    fontWeight: "700",
    borderRadius: "8px",
    cursor: "pointer",
  },

  middle: {
    flex: "2",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    padding: "1.5rem",
    borderRadius: "10px",
    overflowY: "auto",
    fontSize: "14px",
  },

  right: {
    flex: "2",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    padding: "1.5rem",
    borderRadius: "10px",
    overflowY: "auto",
    fontSize: "14px",
  },

  panelHeading: {
    marginBottom: "1rem",
    fontWeight: "700",
    fontSize: "18px",
    color: "#333",
  },

  infoText: {
    fontStyle: "italic",
    color: "#666",
  },

  card: {
    border: "1.5px solid #ccc",
    padding: "1rem",
    marginBottom: "1.25rem",
    borderRadius: "10px",
    backgroundColor: "#fff",
    fontWeight: "500",
    fontSize: "14px",
    color: "#222",
  },

  itineraryList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  error: {
    color: "red",
    fontSize: "13px",
    marginTop: "0.5rem",
    fontWeight: "600",
  },
  flightCardModern: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#fff",
  borderRadius: "16px",
  padding: "1rem 1.5rem",
  marginBottom: "1rem",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  fontSize: "14px",
},

flightDetails: {
  display: "flex",
  alignItems: "center",
  flex: 1,
  gap: "2rem",
},

timeSection: {
  textAlign: "center",
  minWidth: "60px",
},

timeText: {
  fontSize: "16px",
  fontWeight: "700",
  color: "#333",
},

codeText: {
  color: "#666",
  marginTop: "4px",
  fontSize: "13px",
},

pathSection: {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minWidth: "100px",
},

durationText: {
  fontSize: "12px",
  marginBottom: "4px",
  color: "#333",
},

flightPath: {
  display: "flex",
  alignItems: "center",
  gap: "6px",
},

dot: {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  backgroundColor: "#d0006f",
},

line: {
  width: "40px",
  height: "2px",
  backgroundColor: "#999",
},

arrow: {
  fontSize: "14px",
},

stopText: {
  fontSize: "12px",
  marginTop: "4px",
  color: "#d0006f",
  fontWeight: "600",
},

priceSection: {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "6px",
},


priceText: {
  fontSize: "18px",
  fontWeight: "700",
  color: "#000",
},

selectButton: {
  marginTop: "4px",
  padding: "8px 16px",
  backgroundColor: "#d0006f",
  color: "#fff",
  fontWeight: "600",
  border: "none",
  borderRadius: "10px",
  fontSize: "14px",
  cursor: "pointer",
},

};

export default Home;






// import React, { useState } from "react";
// import axios from "axios";
// import { getAmadeusToken } from "../services/amadeus";
// import { signOut } from "firebase/auth";
// import { useNavigate } from "react-router-dom";
// import { auth } from "../services/firebase";

// const Home = () => {
//   const [from, setFrom] = useState("");
//   const [to, setTo] = useState("");
//   const [budget, setBudget] = useState(500);
//   const [date, setDate] = useState("");
//   const [results, setResults] = useState([]);
//   const [itinerary, setItinerary] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [passengers, setPassengers] = useState(1);
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       navigate("/");
//     } catch (err) {
//       console.error("Logout failed:", err.message);
//     }
//   };

//   const fetchFlightOffers = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const accessToken = await getAmadeusToken();
//       const response = await axios.get(
//         "https://test.api.amadeus.com/v2/shopping/flight-offers",
//         {
//           params: {
//             originLocationCode: from.toUpperCase(),
//             destinationLocationCode: to.toUpperCase(),
//             departureDate: date,
//             adults: passengers,
//             nonStop: false,
//             max: 20,
//             currencyCode: "USD",
//             maxPrice: budget,
//           },
//           headers: { Authorization: `Bearer ${accessToken}` },
//         }
//       );
//       setResults(response.data.data);
//     } catch (err) {
//       console.error("Error fetching flights:", err);
//       setError(
//         "Could not fetch flight offers. Please check the airport codes and try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!from || !to || !date) {
//       setError("All fields are required.");
//       return;
//     }
//     fetchFlightOffers();
//   };

//   const handleAddToTrip = (flight) => {
//     setItinerary((prev) => [...prev, flight]);
//   };

//   const handleSaveItinerary = () => {
//     alert("🚀 Itinerary saved successfully!");
//     // You can implement Firestore or localStorage here
//     setItinerary([]);
//   };

//   return (
//     <div style={styles.wrapper}>
//       {/* Search Panel */}

//       <form onSubmit={handleSubmit} style={styles.searchBox}>
//         {/* Origin & Destination */}
//         <div style={styles.sectionBox}>
//           <div>
//             <label style={styles.label}>ORIGIN</label>
//             <input
//               type="text"
//               value={from}
//               onChange={(e) => setFrom(e.target.value.toUpperCase())}
//               placeholder="e.g. DXB"
//               style={styles.airportInput}
//               maxLength={3}
//             />
//           </div>

//           <div
//             style={styles.swapButton}
//             onClick={() => {
//               const temp = from;
//               setFrom(to);
//               setTo(temp);
//             }}
//           >
//             ⇅
//           </div>

//           <div>
//             <label style={styles.label}>DESTINATION</label>
//             <input
//               type="text"
//               value={to}
//               onChange={(e) => setTo(e.target.value.toUpperCase())}
//               placeholder="e.g. LHR"
//               style={styles.airportInput}
//               maxLength={3}
//             />
//           </div>
//         </div>

//         {/* Departure Date */}
//         <div style={styles.sectionBox}>
//           <label style={styles.label}>DEPARTURE</label>
//           <input
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             style={styles.dateInput}
//           />
//         </div>

//         {/* Passengers */}
//         <div style={styles.sectionBox}>
//           <label style={styles.label}>PASSENGERS</label>
//           <input
//             type="number"
//             value={passengers}
//             onChange={(e) =>
//               setPassengers(Math.max(1, parseInt(e.target.value || 1)))
//             }
//             min={1}
//             style={styles.passengerInput}
//           />
//         </div>

//         {/* Search Button */}
//         <button type="submit" style={styles.searchBtn}>
//           SEARCH
//         </button>
//       </form>

//       {/* Results Panel */}
//       <div style={styles.middle}>
//         <h3>🧳 Flights</h3>
//         {loading ? (
//           <p>Loading flights...</p>
//         ) : (
//           results.map((flight, index) => {
//             const offer = flight.itineraries[0];
//             const segments = offer.segments;
//             return (
//               <div key={index} style={styles.flightCard}>
//                 <strong>{segments[0].departure.iataCode}</strong> →{" "}
//                 <strong>
//                   {segments[segments.length - 1].arrival.iataCode}
//                 </strong>
//                 <br />
//                 Stops: {segments.length - 1} <br />
//                 Duration: {offer.duration.replace("PT", "").toLowerCase()}{" "}
//                 <br />
//                 Price: ${flight.price.total}
//                 <button
//                   onClick={() => handleAddToTrip(flight)}
//                   style={styles.addButton}
//                 >
//                   Add to Trip
//                 </button>
//               </div>
//             );
//           })
//         )}
//       </div>

//       {/* Itinerary Panel */}
//       <div style={styles.right}>
//         <h3>📝 Itinerary</h3>
//         {itinerary.length === 0 ? (
//           <p>No flights added yet.</p>
//         ) : (
//           <ul style={{ listStyle: "none", padding: 0 }}>
//             {itinerary.map((flight, i) => {
//               const segments = flight.itineraries[0].segments;
//               return (
//                 <li key={i} style={styles.flightCard}>
//                   ✈️ {segments[0].departure.iataCode} →{" "}
//                   {segments[segments.length - 1].arrival.iataCode}
//                   <br />
//                   💰 ${flight.price.total}
//                 </li>
//               );
//             })}
//           </ul>
//         )}
//         {itinerary.length > 0 && (
//           <button onClick={handleSaveItinerary} style={styles.saveButton}>
//             Save Itinerary
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// const styles = {
//   wrapper: {
//     display: "flex",
//     height: "100vh",
//     padding: "1rem",
//     gap: "1rem",
//     fontFamily: "sans-serif",
//     backgroundColor: "rgba(255,255,255,0.05)",
//     backdropFilter: "blur(5px)",
//   },
//   left: {
//     flex: "1",
//     backgroundColor: "rgba(255, 255, 255, 0.85)",
//     padding: "1rem",
//     borderRadius: "10px",
//     maxWidth: "20%",
//   },
//   middle: {
//     flex: "2",
//     backgroundColor: "rgba(255, 255, 255, 0.85)",
//     padding: "1rem",
//     borderRadius: "10px",
//     overflowY: "auto",
//   },
//   right: {
//     flex: "2",
//     backgroundColor: "rgba(255, 255, 255, 0.85)",
//     padding: "1rem",
//     borderRadius: "10px",
//     overflowY: "auto",
//   },
//   form: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "1rem",
//   },
//   flightCard: {
//     border: "1px solid #ccc",
//     padding: "1rem",
//     marginBottom: "1rem",
//     borderRadius: "8px",
//     backgroundColor: "#f8f8f8",
//   },
//   button: {
//     padding: "10px",
//     backgroundColor: "#007bff",
//     color: "#fff",
//     fontWeight: "bold",
//     border: "none",
//     borderRadius: "6px",
//     cursor: "pointer",
//   },
//   addButton: {
//     marginTop: "0.5rem",
//     padding: "6px 12px",
//     backgroundColor: "#d0006f",
//     color: "#fff",
//     border: "none",
//     borderRadius: "6px",
//     cursor: "pointer",
//   },
//   saveButton: {
//     marginTop: "1rem",
//     padding: "10px 20px",
//     backgroundColor: "#d0006f",
//     color: "#fff",
//     fontWeight: "bold",
//     border: "none",
//     borderRadius: "8px",
//     cursor: "pointer",
//   },
//   logoutButton: {
//     marginTop: "1.5rem",
//     backgroundColor: "#ff4d4d",
//     padding: "10px",
//     border: "none",
//     color: "#fff",
//     fontWeight: "bold",
//     borderRadius: "8px",
//     cursor: "pointer",
//   },
//   error: {
//     color: "red",
//     fontSize: "14px",
//   },
//   searchBox: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "1rem",
//     backgroundColor: "#fff",
//     padding: "1.5rem",
//     borderRadius: "10px",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//     fontSize: "14px",
//   },

//   sectionBox: {
//     border: "1px solid #ccc",
//     borderRadius: "8px",
//     padding: "0.8rem",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     flexWrap: "wrap",
//   },

//   label: {
//     fontSize: "10px",
//     color: "#999",
//     marginBottom: "2px",
//     display: "block",
//   },

//   valueRow: {
//     display: "flex",
//     gap: "0.5rem",
//     alignItems: "baseline",
//   },

//   city: {
//     fontSize: "16px",
//     fontWeight: "bold",
//   },

//   code: {
//     fontSize: "12px",
//     color: "#888",
//   },

//   swapButton: {
//     backgroundColor: "#eee",
//     padding: "0.3rem 0.5rem",
//     borderRadius: "50%",
//     cursor: "pointer",
//     fontSize: "16px",
//     margin: "0 0.5rem",
//     alignSelf: "center",
//   },

//   splitRow: {
//     display: "flex",
//     justifyContent: "space-between",
//     gap: "1rem",
//   },

//   dateInput: {
//     border: "none",
//     background: "transparent",
//     fontSize: "14px",
//     padding: "0.2rem 0",
//     color: "#333",
//   },

//   returnText: {
//     fontSize: "14px",
//     marginTop: "1rem",
//     color: "#555",
//   },

//   searchBtn: {
//     marginTop: "1rem",
//     padding: "0.75rem",
//     backgroundColor: "#d0006f",
//     color: "#fff",
//     border: "none",
//     borderRadius: "8px",
//     fontWeight: "bold",
//     fontSize: "16px",
//     cursor: "pointer",
//   },
  
//   passengerRow: {
//     display: "flex",
//     alignItems: "center",
//     gap: "1rem",
//     justifyContent: "space-between",
//     marginTop: "0.5rem",
//     fontSize: "14px",
//   },

//   passengerButton: {
//     padding: "0.25rem 0.75rem",
//     fontSize: "18px",
//     border: "none",
//     borderRadius: "6px",
//     backgroundColor: "#eee",
//     cursor: "pointer",
//     fontWeight: "bold",
//   },
//   airportInput: {
//     padding: '8px',
//     fontSize: '14px',
//     borderRadius: '6px',
//     border: '1px solid #ccc',
//     width: '80%',
//     textTransform: 'uppercase'
//   },
  
//   dateInput: {
//     padding: '8px',
//     fontSize: '14px',
//     borderRadius: '6px',
//     border: '1px solid #ccc',
//     width: '100%'
//   },
  
//   passengerInput: {
//     padding: '8px',
//     fontSize: '14px',
//     borderRadius: '6px',
//     border: '1px solid #ccc',
//     width: '100%',
//     appearance: 'textfield'
//   },
  
//   swapButton: {
//     fontSize: '20px',
//     cursor: 'pointer',
//     marginTop: '30px',
//     padding: '0 10px',
//     userSelect: 'none'
//   }
  
// };

// export default Home;

