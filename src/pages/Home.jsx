import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAmadeusToken } from "../services/amadeus";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import Header from "../components/Header";
import Loading from "../components/Loading";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";

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
  const { i18n, t } = useTranslation();
  const isRTL = i18n.language === "ar";

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
      console.error("@@@@Error:", err);
      setError(
        "Could not carry out your instructions. Please try again later."
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

  const onClickSearchFlights = async (e) => {
    e.preventDefault();
    if (!from || !to || !date) {
      setError("All fields are mandatory.");
      return;
    }
    try {
      setLoadingFlights(true);
      await fetchFlightOffers();
    } catch (error) {
      console.error("@@@@@error", error);
    } finally {
      setLoadingFlights(false);
    }
  };

  const onClickSelectTrip = (flight) => {
    setItinerary((prev) => [...prev, flight]);
  };

  const onClickSveItinerary = () => {
    // if (!user) {
    //   alert("No user logged in. Please log in to save itinerary.");
    //   return;
    // }
    if (!itinerary.length) return;

    setShowPopup(true);
  };

  const onClickSveItineraryPopup = async () => {
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

      alert(t("Tripdetailssaved"));
    } catch (error) {
      alert("Failed to save trip.");
      console.error("@@@@error:", error);
    }
  };
  const onClickDeleteTrip = (indexToRemove) => {
    setItinerary((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div>
      {loadingFlights && <Loading />}
      <Header />
      <div style={styles.sknFlxMain}>
        {showPopup && (
          <div style={popupStyles.sknCverlay}>
            <div style={popupStyles.sknPopup}>
              <h2 style={popupStyles.sknPopupTitle}>{t("Entertripdetails")}</h2>

              <input
                type="text"
                placeholder={t("EnterTripName")}
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                style={popupStyles.sknPopupInput}
              />

              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file.size >= 1024 * 1024) {
                    alert("Please upload an image below 1MB.");
                    return;
                  }
                  if (file) {
                    const base64 = await fileToBase64(file);
                    setCoverImageBase64(base64);
                  }
                }}
              />

              {coverImageBase64 && (
                <div style={popupStyles.sknPopupImagePreviewMain}>
                  <img
                    src={coverImageBase64}
                    alt="Preview"
                    style={popupStyles.sknPopupImagePreview}
                  />
                  <button
                    onClick={() => setCoverImageBase64("")}
                    style={styles.sknBtnSelect}
                  >
                    {t("removeImage")}
                  </button>
                </div>
              )}

              <button onClick={onClickSveItineraryPopup} style={styles.sknBtn}>
                {t("save")}
              </button>
            </div>
          </div>
        )}
        {showSavedMessage && (
          <div style={styles.sknSavedMessage}>{t("Tripdetailssaved")}</div>
        )}

        <form onSubmit={onClickSearchFlights} style={styles.sknsearchBox}>
          <div style={styles.sknFlxSection}>
            <div>
              <label style={styles.label}>{t("Origin")}</label>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value.toUpperCase())}
                placeholder={t("From")}
                style={styles.input}
                maxLength={3}
              />
            </div>

            <div
              style={styles.sknswapBtn}
              onClick={() => {
                const temp = from;
                setFrom(to);
                setTo(temp);
              }}
            >
              ⇅
            </div>

            <div>
              <label style={styles.label}>{t("Destination")}</label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value.toUpperCase())}
                placeholder={t("To")}
                style={styles.input}
                maxLength={3}
              />
            </div>
          </div>

          <div style={styles.sknFlxSection}>
            <label style={styles.label}>{t("Departure")}</label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.sknFlxSection}>
            <label style={styles.label}>{t("Passengers")}</label>
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

          <button type="submit" style={styles.sknBtn}>
            {t("Search")}
          </button>

          {error && <p style={styles.sknErrorRed}>{error}</p>}
        </form>

        {/* Flights */}
        <div style={styles.sknFLxMainMiddle}>
          <h1 style={styles.sknPanelHeading}>{t("Flights")}</h1>
          {results.length === 0 ? (
            <p style={styles.sknInfoText}>{t("Noflightfound")}</p>
          ) : (
            results.map((flight, index) => {
              const trip = flight.itineraries[0];
              const segments = trip.segments;
              const dep = segments[0].departure;
              const arr = segments[segments.length - 1].arrival;
              const duration = trip.duration.replace("PT", "").toLowerCase();
              const stops = segments.length - 1;
              const stop =
                stops > 0 ? segments[0].arrival.iataCode : t("nonstop");

              const traveler = flight.travelerPricings[0];
              const fareDetail = traveler.fareDetailsBySegment[0];

              return (
                <div key={index} style={styles.sknFlightCardMain}>
                  <div style={styles.sknFlightCard}>
                    <div style={styles.sknFlxflightDetails}>
                      <div style={styles.sknFlxTime}>
                        <div style={styles.sknTxtTime}>
                          {dep.at.slice(11, 16)}
                        </div>
                        <div style={styles.sknTxtCode}>{dep.iataCode}</div>
                        <div style={styles.sknTxtCode}>
                          {dep.at.slice(8, 10) +
                            "-" +
                            dep.at.slice(5, 7) +
                            "-" +
                            dep.at.slice(0, 4)}
                        </div>
                      </div>

                      <div style={styles.sknFlxPath}>
                        <div style={styles.sknTxtDuration}>{duration}</div>
                        <div
                          style={{
                            ...styles.sknFlxflightPath,
                            flexDirection: isRTL ? "row-reverse" : "row",
                          }}
                        >
                          {isRTL ? (
                            <>
                              <div style={styles.sknDot}></div>
                              <div style={styles.sknFlxLine}></div>
                              <div
                                style={{
                                  ...styles.sknFLightEmoji,
                                  transform: "scaleX(-1)",
                                }}
                              >
                                ✈︎
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={styles.sknFLightEmoji}>✈︎</div>
                              <div style={styles.sknFlxLine}></div>
                              <div style={styles.sknDot}></div>
                            </>
                          )}
                        </div>
                        <div style={styles.skntxtStop}>
                          {stops > 0 ? `${stops} ${t("stop")}` : t("nonstop")}
                          {stops > 0 && <span>{stop}</span>}
                        </div>
                      </div>

                      <div style={styles.sknFlxTime}>
                        <div style={styles.sknTxtTime}>
                          {arr.at.slice(11, 16)}
                        </div>
                        <div style={styles.sknTxtCode}>{arr.iataCode}</div>
                        <div style={styles.sknTxtCode}>
                          {arr.at.slice(8, 10) +
                            "-" +
                            arr.at.slice(5, 7) +
                            "-" +
                            arr.at.slice(0, 4)}
                        </div>
                      </div>
                    </div>

                    <div style={styles.sknFlxPrice}>
                      <div style={styles.sknTxtPrice}>
                        ${flight.price.total}
                      </div>
                      <button
                        onClick={() => onClickSelectTrip(flight)}
                        style={styles.sknBtnSelect}
                      >
                        {t("select")}
                      </button>
                    </div>
                  </div>
                  <div>
                    <div style={styles.sknTxtDextraDetails}>
                      <label
                        style={{
                          ...styles.sknTxtDextraDetails,
                          display: "block",
                          textAlign: isRTL ? "right" : "left",
                        }}
                      >
                        {t("Cabin")} :{" "}
                        {"         " + fareDetail.cabin.toLowerCase()}
                      </label>
                    </div>
                    <div style={styles.sknTxtextraDetailsBags}>
                      {fareDetail.includedCheckedBags && (
                        <label style={styles.sknTxtDextraDetails}>
                          {t("checkinBags")} :{" "}
                          {fareDetail.includedCheckedBags.weight
                            ? fareDetail.includedCheckedBags.weight
                            : "0"}{" "}
                          {fareDetail.includedCheckedBags.weightUnit
                            ? fareDetail.includedCheckedBags.weightUnit.toLowerCase()
                            : "kg"}
                        </label>
                      )}

                      {fareDetail.includedCabinBags && (
                        <label style={styles.sknTxtDextraDetails}>
                          {t("cabinBags")} :{" "}
                          {fareDetail.includedCabinBags.weight
                            ? fareDetail.includedCabinBags.weight
                            : "0"}{" "}
                          {fareDetail.includedCabinBags.weightUnit
                            ? fareDetail.includedCabinBags.weightUnit.toLowerCase()
                            : "kg"}
                        </label>
                      )}
                    </div>
                    {fareDetail.amenities &&
                      fareDetail.amenities.length > 0 && (
                        <div style={{ direction: isRTL ? "rtl" : "ltr" }}>
                          <label
                            style={{
                              ...styles.sknTxtDextraDetails,
                              display: "block",
                              textAlign: isRTL ? "right" : "left",
                            }}
                          >
                            {t("Amenities")} :{" "}
                          </label>
                          <ul
                            style={{
                              paddingInline: "10px",
                              marginTop: "7px",
                              fontSize: "12px",
                              marginBottom: "1px",
                              color: "#333",
                              textAlign: isRTL ? "right" : "left",
                            }}
                          >
                            {fareDetail.amenities.map((item, i) => (
                              <li key={i} style={{ marginBottom: "5px" }}>
                                {item.description.toLowerCase()}
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

        {/* Itinerary */}
        <div style={styles.sknFLxMainMiddle}>
          <h1 style={styles.sknPanelHeading}>{t("Itinerary")}</h1>
          {itinerary.length === 0 ? (
            <p style={styles.sknInfoText}>{t("Noflightsaddedyet")}</p>
          ) : (
            <ul style={styles.sknIitineraryList}>
              {itinerary.map((flight, index) => {
                const segments = flight.itineraries[0].segments;
                const trip = flight.itineraries[0];
                const dep = segments[0].departure;
                const arr = segments[segments.length - 1].arrival;
                const duration = trip.duration.replace("PT", "").toLowerCase();
                const stops = segments.length - 1;
                const stop =
                  stops > 0 ? segments[0].arrival.iataCode : t("nonstop");

                const traveler = flight.travelerPricings[0];

                return (
                  <div
                    key={index}
                    style={{ ...styles.sknFlightCard, position: "relative" }}
                  >
                    <button
                      onClick={() => onClickDeleteTrip(index)}
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
                    >
                      ×
                    </button>
                    <div style={styles.sknFlxflightDetails}>
                      <div style={styles.sknFlxTime}>
                        <div style={styles.sknTxtTime}>
                          {dep.at.slice(11, 16)}
                        </div>
                        <div style={styles.sknTxtCode}>{dep.iataCode}</div>
                        <div style={styles.sknTxtCode}>
                          {dep.at.slice(8, 10) +
                            "-" +
                            dep.at.slice(5, 7) +
                            "-" +
                            dep.at.slice(0, 4)}
                        </div>
                      </div>

                      <div style={styles.sknFlxPath}>
                        <div style={styles.sknTxtDuration}>{duration}</div>
                        <div
                          style={{
                            ...styles.sknFlxflightPath,
                            flexDirection: isRTL ? "row-reverse" : "row",
                          }}
                        >
                          {isRTL ? (
                            <>
                              <div style={styles.sknDot}></div>
                              <div style={styles.sknFlxLine}></div>
                              <div
                                style={{
                                  ...styles.sknFLightEmoji,
                                  transform: "scaleX(-1)",
                                }}
                              >
                                ✈︎
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={styles.sknFLightEmoji}>✈︎</div>
                              <div style={styles.sknFlxLine}></div>
                              <div style={styles.sknDot}></div>
                            </>
                          )}
                        </div>
                        <div style={styles.skntxtStop}>
                          {stops > 0 ? `${stops} ${t("stop")}` : t("nonstop")}
                          {stops > 0 && <span>{stop}</span>}
                        </div>
                      </div>

                      <div style={styles.sknFlxTime}>
                        <div style={styles.sknTxtTime}>
                          {arr.at.slice(11, 16)}
                        </div>
                        <div style={styles.sknTxtCode}>{arr.iataCode}</div>
                        <div style={styles.sknTxtCode}>
                          {arr.at.slice(8, 10) +
                            "-" +
                            arr.at.slice(5, 7) +
                            "-" +
                            arr.at.slice(0, 4)}
                        </div>
                      </div>
                    </div>

                    <div style={styles.sknFlxPrice}>
                      <div style={styles.sknTxtPrice}>
                        ${flight.price.total}
                      </div>
                    </div>
                  </div>
                );
              })}
            </ul>
          )}
          {itinerary.length > 0 && (
            <button onClick={onClickSveItinerary} style={styles.sknBtn}>
              {t("saveItinerary")}
            </button>
          )}
          <div></div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const styles = {
  sknFlxMain: {
    display: "flex",
    height: "89vh",
    width: "100%",
    padding: "1.5rem",
    gap: "1.5rem",
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(5px)",
  },

  sknsearchBox: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: "6px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    fontSize: "14px",
  },

  sknFlxSection: {
    border: "1px solid #ccc",
    borderRadius: "6px",
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

  sknswapBtn: {
    fontSize: "22px",
    cursor: "pointer",
    padding: "6px 70px",
    userSelect: "none",
    color: "#d0006f",
    alignSelf: "center",
    borderRadius: "6px",
    border: "1.5px solid transparent",
  },

  sknBtn: {
    marginTop: "1rem",
    padding: "0.8rem",
    backgroundColor: "#d0006f",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },

  sknFLxMainMiddle: {
    flex: "2",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    padding: "1.5rem",
    borderRadius: "10px",
    overflowY: "auto",
    fontSize: "14px",
  },

  sknPanelHeading: {
    marginBottom: "1rem",
    fontWeight: "600",
    fontSize: "18px",
    color: "#333",
  },

  sknInfoText: {
    fontStyle: "italic",
    color: "#666",
  },

  sknIitineraryList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  sknErrorRed: {
    color: "red",
    fontSize: "13px",
    marginTop: "0.5rem",
    fontWeight: "600",
  },
  sknFlightCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "1rem 1rem",
    marginBottom: "1rem",
    fontSize: "14px",
    borderRadius: "16px",
  },

  sknFlightCardMain: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "1rem 1.5rem",
    marginBottom: "1rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    fontSize: "14px",
    textAlign: "left",
  },

  sknFlxflightDetails: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    gap: "1rem",
    left: "-1%",
  },

  sknFlxTime: {
    textAlign: "center",
    minWidth: "60px",
  },

  sknTxtTime: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
  },

  sknTxtCode: {
    color: "#666",
    marginTop: "4px",
    fontSize: "13px",
  },

  sknFlxPath: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "100px",
  },

  sknTxtDuration: {
    fontSize: "12px",
    marginBottom: "4px",
    color: "#333",
  },

  sknTxtDextraDetails: {
    fontSize: "13px",
    marginBottom: "8px",
    color: "#333",
    textAlign: "inherit",
    display: "block",
  },

  sknTxtextraDetailsBags: {
    fontSize: "13px",
    color: "#333",
    flexDirection: "row",
    justifyContent: "space-between",
    display: "flex",
  },

  sknFlxflightPath: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  sknDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#d0006f",
  },

  sknFlxLine: {
    width: "40px",
    height: "2px",
    backgroundColor: "#999",
  },

  sknFLightEmoji: {
    fontSize: "25px",
  },

  skntxtStop: {
    fontSize: "12px",
    marginTop: "4px",
    color: "#d0006f",
    fontWeight: "600",
  },

  sknFlxPrice: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "10px",
  },

  sknTxtPrice: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#000",
    gap: "10px",
  },

  sknBtnSelect: {
    marginTop: "4px",
    padding: "7px 15px",
    backgroundColor: "#d0006f",
    color: "#fff",
    fontWeight: "600",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
  },

  sknSavedMessage: {
    position: "fixed",
    bottom: "2rem",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#d0006f",
    color: "#fff",
    padding: "1rem 2rem",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "15px",
    zIndex: 2,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    animation: "fadein 0.5s ease",
  },
};

const popupStyles = {
  sknCverlay: {
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
  sknPopup: {
    width: "35%",
    height: "60%",
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "6px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#333",
  },
  sknPopupTitle: {
    fontSize: "20px",
    fontWeight: "600",
  },
  sknPopupInput: {
    padding: "10px",
    fontSize: "14px",
    border: "1.5px solid #ccc",
    borderRadius: "6px",
    outline: "none",
  },
  sknPopupImagePreviewMain: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  sknPopupImagePreview: {
    height: "100px",
    borderRadius: "6px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
};

export default Home;
