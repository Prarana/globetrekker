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
  const [showPopup, setShowPopup] = useState(false);
  const [tripName, setTripName] = useState("");
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [coverImageBase64, setCoverImageBase64] = useState("");


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

    const fileToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
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

  const navigateToTrips = () => {
    navigate("/trips");
  };


  const handleSaveItinerary = () => {
    if (!user) {
      alert("No user is logged in. Please log in to save itinerary.");
      return;
    }
    if (!itinerary.length) return;

    setShowPopup(true); 
  };

  const finalizeSaveTrip = async () => {
    try {
      const docRef = await addDoc(collection(db, "itineraries"), {
        uid: user.uid,
        createdAt: Timestamp.now(),
        name: tripName,
        coverImage: coverImageBase64,
        flights: itinerary,
      });

      setShowPopup(false);
      setTripName("");
      setCoverImageBase64("");
      setItinerary([]);

      alert("Trip details saved. Please check trip details from My Trips.");
    } catch (error) {
      alert("Failed to save trip.");
      console.error("Save error:", error);
    }
  };

  return (
    <div style={styles.wrapper}>
      {showPopup && (
        <div style={popupStyles.overlay}>
          <div style={popupStyles.popup}>
            <h2 style={popupStyles.title}>Name Your Trip</h2>

            <input
              type="text"
              placeholder="e.g. Paris Honeymoon"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              style={popupStyles.input}
            />

            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const base64 = await fileToBase64(file);
                  setCoverImageBase64(base64);
                }
              }}
            />

            {coverImageBase64 && (
              <div style={popupStyles.imagePreviewBox}>
                <img
                  src={coverImageBase64}
                  alt="Preview"
                  style={popupStyles.imagePreview}
                />
                <button
                  onClick={() => setCoverImageBase64("")}
                  style={popupStyles.deleteBtn}
                >
                  Remove Image
                </button>
              </div>
            )}

            <button onClick={finalizeSaveTrip} style={popupStyles.saveBtn}>
              Save
            </button>
          </div>
        </div>
      )}

      {showSavedMessage && (
        <div style={styles.savedMessage}>
          Trip details saved. Please check trip details from My Trips.
        </div>
      )}

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
        <button
          type="button"
          onClick={handleLogout}
          style={styles.logoutButton}
        >
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
            const stopCity =
              stops > 0 ? segments[0].arrival.iataCode : "Non-stop";

            return (
              <div key={index} style={styles.flightCardModern}>
                <div style={styles.flightDetails}>
                  <div style={styles.timeSection}>
                    <div style={styles.timeText}>
                      {dep.at.slice(11, 16)} 
                    </div>
                    <div style={styles.codeText}>{dep.iataCode}</div>
                  </div>

                  <div style={styles.pathSection}>
                    <div style={styles.durationText}>{duration}</div>
                    <div style={styles.flightPath}>
                      <div style={styles.arrow}> ✈︎ </div> 
                      <div style={styles.line}></div>
                      <div style={styles.dot}></div>
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
        <div></div>
        <button onClick={navigateToTrips} style={styles.button}>
          Show Trips
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    height: "100%",
    width: "100%",
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
    transition: "background-color 0.5s ease",
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
    backgroundColor: "#d0006f", 
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
    fontSize: "25px",
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
  popup: {
    position: "fixed",
    top: "25%",
    left: "25%",
    width: "40%",
    height: "60%",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
    zIndex: 2,
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    justifyContent: "space-between",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 2,
  },
  savedMessage: {
    position: "fixed",
    bottom: "2rem",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#d0006f",
    color: "#fff",
    padding: "1rem 2rem",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "15px",
    zIndex: 2,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    animation: "fadein 0.5s ease",
  },
  deleteImageButton: {
    backgroundColor: "#999",
    color: "#fff",
    padding: "0.4rem 0.75rem",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "600",
  },
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  popupBox: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    width: "50%",
    height: "50%",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  },
  input: {
    padding: "0.75rem",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    width: "80%",
  },
  button: {
    marginTop: "1rem",
    padding: "0.85rem",
    backgroundColor: "#d0006f",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
  },
};

const popupStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  popup: {
    width: "50%",
    height: "50%",
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
  },
  input: {
    padding: "10px",
    fontSize: "14px",
    border: "1.5px solid #ccc",
    borderRadius: "6px",
    outline: "none",
  },
  imagePreviewBox: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  imagePreview: {
    height: "80px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  },
  deleteBtn: {
    backgroundColor: "#ccc",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  saveBtn: {
    padding: "0.85rem",
    backgroundColor: "#d0006f",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
  },
};

export default Home;

