import React, { useState } from "react";
import axios from "axios";
import { getAmadeusToken } from "../services/amadeus";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import Header from "../components/Header";
import Loading from "../components/Loading";
import Footer from "../components/Footer";

const Home = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [budget, setBudget] = useState(1000);
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
  const [loadingFlights, setLoadingFlights] = useState(false);

  const navigate = useNavigate();

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
        //   params: {
        //     originLocationCode: "HYD",
        //     destinationLocationCode: "AUH",
        //     departureDate: "2025-07-11",
        //     adults: "1",
        //     nonStop: false,
        //     max: 200,
        //     currencyCode: "USD",
        //     maxPrice: budget,
        //   },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!from || !to || !date) {
    //   setError("All fields are required.");
    //   return;
    // }
    try {
      setLoadingFlights(true);
      await fetchFlightOffers();
    } catch (error) {
      console.error("Flight search error", error);
    } finally {
      setLoadingFlights(false);
    }
  };

  const handleAddToTrip = (flight) => {
    setItinerary((prev) => [...prev, flight]);
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
  const handleRemoveFromTrip = (indexToRemove) => {
    setItinerary((prev) => prev.filter((_, index) => index !== indexToRemove));
  };
  

  return (
    <div>
      {loadingFlights && <Loading />}
      <Header />
      <div style={styles.wrapper}>
        {showPopup && (
          <div style={popupStyles.overlay}>
            <div style={popupStyles.popup}>
              <h2 style={popupStyles.title}>Enter trip details</h2>

              <input
                type="text"
                placeholder="Enter trip name"
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

              <button onClick={finalizeSaveTrip} style={styles.button}>
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
                placeholder="From"
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
                placeholder="To"
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
              min={new Date().toISOString().split("T")[0]}
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
        </form>

        {/* Results Panel */}
        <div style={styles.middle}>
          <h1 style={styles.panelHeading}>Flights</h1>
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

              const traveler = flight.travelerPricings[0];
              const fareDetail = traveler.fareDetailsBySegment[0];

              return (
                <div key={index} style={styles.flightCard}>
                  <div style={styles.flightCardModern}>
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
                        Select
                      </button>
                    </div>
                  </div>
                  <div>
                    <div style={styles.extraDetailsText}>
                      <label style={styles.extraDetailsText}>
                        Cabin : {"         " + fareDetail.cabin}
                      </label>
                    </div>
                    <div style={styles.extraDetailsBags}>
                      {fareDetail.includedCheckedBags && (
                        <label style={styles.extraDetailsText}>
                          Checked Bags :{" "}
                          {fareDetail.includedCheckedBags.weight
                            ? fareDetail.includedCheckedBags.weight
                            : "0"}{" "}
                          {fareDetail.includedCheckedBags.weightUnit
                            ? fareDetail.includedCheckedBags.weightUnit
                            : "KG"}
                        </label>
                      )}

                      {fareDetail.includedCabinBags && (
                        <label style={styles.extraDetailsText}>
                          Cabin Bags :{" "}
                          {fareDetail.includedCabinBags.weight
                            ? fareDetail.includedCabinBags.weight
                            : "0"}{" "}
                          {fareDetail.includedCabinBags.weightUnit
                            ? fareDetail.includedCabinBags.weightUnit
                            : "KG"}
                        </label>
                      )}
                    </div>
                    {fareDetail.amenities &&
                      fareDetail.amenities.length > 0 && (
                        <div>
                          <label style={styles.extraDetailsText}>
                            Amenities :{" "}
                          </label>
                          <ul
                            style={{
                              paddingInline: "10px",
                              marginTop: "7px",
                              fontSize: "12px",
                              marginBottom: "1px",
                              color: "#333",
                            }}
                          >
                            {fareDetail.amenities.map((item, i) => (
                              <li key={i} style={{ marginBottom: "5px" }}>
                                {item.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Itinerary Panel */}
        <div style={styles.right}>
          <h1 style={styles.panelHeading}>Itinerary</h1>
          {itinerary.length === 0 ? (
            <p style={styles.infoText}>No flights added yet.</p>
          ) : (
            <ul style={styles.itineraryList}>
              {itinerary.map((flight, index) => {
                const segments = flight.itineraries[0].segments;
                const offer = flight.itineraries[0];
                const dep = segments[0].departure;
                const arr = segments[segments.length - 1].arrival;
                const duration = offer.duration.replace("PT", "").toLowerCase();
                const stops = segments.length - 1;
                const stopCity =
                  stops > 0 ? segments[0].arrival.iataCode : "Non-stop";

                const traveler = flight.travelerPricings[0];

                return (
                  <div
                    key={index}
                    style={{ ...styles.flightCardModern, position: "relative" }}
                  >
                    <button
                      onClick={() => handleRemoveFromTrip(index)}
                      style={{
                        position: "absolute",
                        top: "2px",
                        right: "0px",
                        background: "white",
                        border: "none",
                        fontSize: "20px",
                        color: "#d0006f",
                        cursor: "pointer",
                      }}
                      title="Remove from itinerary"
                    >
                      ×
                    </button>
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
                          <div style={styles.arrow}>✈︎</div>
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
                        </div>
                        <div style={styles.codeText}>{arr.iataCode}</div>
                      </div>
                    </div>

                    <div style={styles.priceSection}>
                      <div style={styles.priceText}>${flight.price.total}</div>
                    </div>
                  </div>
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
        </div>
      </div>
      <Footer/>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    height: "89vh",
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

  input :{
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

  inputFocus :{
    borderColor: "#d0006f",
  },

  swapButton: {
    fontSize: "22px",
    cursor: "pointer",
    padding: "6px 70px",
    userSelect: "none",
    color: "#d0006f",
    alignSelf: "center",
    borderRadius: "8px",
    border: "1.5px solid transparent",
  },

  button: {
    marginTop: "1rem",
    padding: "0.8rem",
    backgroundColor: "#d0006f",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
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
    padding: "1rem 1rem",
    marginBottom: "1rem",
    fontSize: "14px",
  },

  flightCard: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "1rem 1.5rem",
    marginBottom: "1rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    fontSize: "14px",
    textAlign: "left",
  },

  flightDetails: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    gap: "1rem",
    left: "-1%",
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

  extraDetailsText: {
    fontSize: "13px",
    marginBottom: "8px",
    color: "#333",
  },

  extraDetailsBags: {
    fontSize: "13px",
    color: "#333",
    flexDirection: "row",
    justifyContent: "space-between",
    display: "flex",
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
    gap: "10px",
  },

  priceText: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#000",
    gap: "10px",
  },

  selectButton: {
    marginTop: "4px",
    padding: "8px 16px",
    backgroundColor: "#d0006f",
    color: "#fff",
    fontWeight: "600",
    border: "none",
    borderRadius: "10px",
    fontSize: "13px",
    cursor: "pointer",
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
    padding: "0.4rem 0.8rem",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "600",
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
    zIndex: 2,
  },
  popup: {
    width: "35%",
    height: "53%",
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
    fontWeight: "600",
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
    height: "100px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  },
  deleteBtn: {
    backgroundColor: "#d0006f",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
 
};

export default Home;
