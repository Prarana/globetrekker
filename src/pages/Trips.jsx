import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../services/firebase";
import Header from "../components/Header";
import Loading from "../components/Loading";

const Trips = () => {
  const { user } = useAuth();
  const [itineraries, setItineraries] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loadingTrips, setLoadingTrips] = useState(false);

  useEffect(() => {
    const fetchItineraries = async () => {
      if (!user) return;
      try {
        setLoadingTrips(true);
        const q = query(
          collection(db, "itineraries"),
          where("uid", "==", user.uid)
        );
        const snapshot = await getDocs(q);

        const fetched = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            };
          })
        );

        setItineraries(fetched);
        if (fetched.length > 0) setSelectedTrip(fetched[0]);
      } catch (error) {
        console.error("Error fetching itineraries:", error);
      } finally {
        setLoadingTrips(false);
      }
    };

    fetchItineraries();
  }, [user]);

  return (
    <div>
      {loadingTrips && <Loading />}
      <Header />
      <div style={styles.wrapper}>
        {/* Left side */}
        <div style={styles.leftPanel}>
          <h2 style={styles.heading}>My Trips</h2>
          {itineraries.map((trip, index) => (
            <div
              key={trip.id}
              onClick={() => setSelectedTrip(trip)}
              style={{
                ...styles.tripItem,
                backgroundColor:
                  selectedTrip?.id === trip.id ? "#ffeaf4" : "#fff",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
              }}
            >
              {trip.coverImage && trip.coverImage.startsWith("data:image") ? (
                <img
                  src={trip.coverImage}
                  alt={`${trip.tripName || `Trip #${index + 1}`} cover`}
                  style={styles.coverImage}
                />
              ) : (
                <div style={styles.noCoverImage}>No Cover Image</div>
              )}

              <div style={styles.tripName}>
                {trip.name || trip.tripName || `Trip #${index + 1}`}
              </div>

              <div style={styles.dateText}>
                {trip.createdAt?.toDate().toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* Right side */}
        <div style={styles.rightPanel}>
          {selectedTrip ? (
            selectedTrip.flights.map((flight, index) => {
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
                      <div style={styles.timeText}>{dep.at.slice(11, 16)}</div>
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
                      <div style={styles.timeText}>{arr.at.slice(11, 16)}</div>
                      <div style={styles.codeText}>{arr.iataCode}</div>
                    </div>
                  </div>

                  <div style={styles.priceSection}>
                    <div style={styles.priceText}>${flight.price.total}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={styles.infoText}>Select a trip to see details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    height: "93vh",
    width: "100%",
    gap: "1.5rem",
    padding: "1.5rem",
    backgroundColor: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(5px)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  leftPanel: {
    width: "20%",
    backgroundColor: "#fff",
    color: "#666",
    borderRadius: "10px",
    padding: "1rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    overflowY: "auto",
  },
  rightPanel: {
    width: "80%",
    backgroundColor: "#fff",
    color: "#666",
    borderRadius: "10px",
    padding: "1.5rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    overflowY: "auto",
  },
  heading: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "1rem",
  },
  tripItem: {
    padding: "0.75rem 1rem",
    border: "1px solid #eee",
    borderRadius: "8px",
    marginBottom: "0.75rem",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  tripName: {
    fontWeight: "600",
    fontSize: "14px",
    marginBottom: "0.5rem",
  },
  coverImage: {
    width: "100%",
    height: "100px",
    objectFit: "cover",
    borderRadius: "6px",
    marginBottom: "0.5rem",
  },
  dateText: {
    fontSize: "12px",
    color: "#999",
  },
  infoText: {
    fontStyle: "italic",
    color: "#999",
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
    minWidth: "500px",
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
    minWidth: "400px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#d0006f",
  },
  line: {
    width: "400px",
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
  tripItem: {
    padding: "0.5rem 1rem",
    border: "1px solid #eee",
    borderRadius: "8px",
    marginBottom: "1rem",
    transition: "background-color 0.2s ease",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },

  coverImage: {
    width: "100%",
    height: "120px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "0.5rem",
  },

  noCoverImage: {
    width: "100%",
    height: "120px",
    borderRadius: "8px",
    backgroundColor: "#f0f0f0",
    color: "#999",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "14px",
    marginBottom: "0.5rem",
  },

  tripName: {
    fontWeight: "700",
    fontSize: "16px",
    color: "#333",
    marginBottom: "0.25rem",
  },
};

export default Trips;
