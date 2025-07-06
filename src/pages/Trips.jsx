import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../services/firebase";
import Header from "../components/Header";
import Loading from "../components/Loading";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Trips = () => {
  const { user } = useAuth();
  const [itineraries, setItineraries] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const { i18n, t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const itineraryRef = useRef();

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        setLoadingTrips(true);
        const q = query(
          collection(db, "itineraries"),
          where("uid", "==", user.uid)
        );
        const getDocuments = await getDocs(q);

        const trips = await Promise.all(
          getDocuments.docs.map(async (doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            };
          })
        );

        setItineraries(trips);
        if (trips.length > 0) setSelectedTrip(trips[0]);
      } catch (error) {
        console.error("@@@@Error", error);
      } finally {
        setLoadingTrips(false);
      }
    };

    fetchItineraries();
  }, [user]);

  const onClickExportPDF = async () => {
    const input = itineraryRef.current;
    if (!input || !selectedTrip) return;

    const page = await html2canvas(input, { scale: 2 });
    const img = page.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 5;
    let y = 5;

    if (selectedTrip.coverImage) {
      const img = new Image();
      img.src = selectedTrip.coverImage;

      await new Promise((resolve) => {
        img.onload = () => {
          const imgWidth = pdfWidth - margin * 2;
          const imgHeight = (img.height * imgWidth) / img.width;
          pdf.addImage(img, "JPEG", margin, y, imgWidth, imgHeight);
          y += imgHeight + 5;
          resolve();
        };
      });
    }
    const tripName = selectedTrip.name || "My Trip";
    pdf.text(tripName, pdfWidth / 2, y + 5, { align: "center" });
    y += 15;
    const imgProps = pdf.getImageProperties(img);
    const width = pdfWidth - margin * 2;
    const height = (imgProps.height * width) / imgProps.width;
    pdf.addImage(img, "PNG", margin, y, width, height);

    pdf.save("Trip_Itinerary.pdf");
  };

  return (
    <div>
      {loadingTrips && <Loading />}
      <Header />
      <div style={styles.sknFlxMain}>
        {/* Left side */}
        <div style={styles.sknFlxMainLeft}>
          <h2 style={styles.sknTxtHeading}>{t("MyTrips")}</h2>
          {itineraries.map((trip, index) => (
            <div
              key={trip.id}
              onClick={() => setSelectedTrip(trip)}
              style={{
                ...styles.sknFlxTripItem,
                backgroundColor:
                  selectedTrip?.id === trip.id ? "#ffeaf4" : "#fff",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {trip.coverImage && trip.coverImage.startsWith("data:image") ? (
                <img
                  src={trip.coverImage}
                  alt={`${trip.tripName || `Trip : ${index + 1}`} cover`}
                  style={styles.sknFlxCoverImage}
                />
              ) : (
                <div style={styles.sknFlxNoCoverImage}>{t("NoCoverImage")}</div>
              )}

              <div style={styles.sknTxtTripName}>
                {trip.name || trip.tripName || `Trip : ${index + 1}`}
              </div>

              <div style={styles.sknTxtDate}>
                {trip.createdAt?.toDate().toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* Right side */}
        <div style={styles.sknFlxMainRight}>
          <div ref={itineraryRef}>
            {selectedTrip ? (
              selectedTrip.flights.map((flight, index) => {
                const trip = flight.itineraries[0];
                const segments = trip.segments;
                const dep = segments[0].departure;
                const arr = segments[segments.length - 1].arrival;
                const duration = trip.duration
                  .replace("PT", "")
                  .toLowerCase();
                const stops = segments.length - 1;
                const stopCity =
                  stops > 0 ? segments[0].arrival.iataCode : t("nonstop");

                return (
                  <div key={index} style={styles.sknFlightCardMain}>
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

                      <div style={styles.pathSection}>
                        <div style={styles.durationText}>{duration}</div>
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
                          {stops > 0 && <span>{stopCity}</span>}
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
              })
            ) : (
              <p style={styles.sknTxtInfo}>Select a trip to see details.</p>
            )}
          </div>
          <div style={styles.sknFlxExport}>
            <button onClick={onClickExportPDF} style={styles.sknButton}>
              {t("ExportPDF")}
            </button>
          </div>
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
    gap: "1.5rem",
    padding: "1.5rem",
    backdropFilter: "blur(5px)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  sknFlxMainLeft: {
    width: "30%",
    backgroundColor: "#fff",
    color: "#666",
    borderRadius: "10px",
    padding: "1rem",
    overflowY: "auto",
  },
  sknFlxMainRight: {
    width: "70%",
    backgroundColor: "#fff",
    color: "#666",
    borderRadius: "10px",
    padding: "1.5rem",
    overflowY: "auto",
  },
  sknTxtHeading: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "1rem",
  },
  sknFlxTripItem: {
    padding: "0.75rem 1rem",
    border: "1px solid #eee",
    borderRadius: "6px",
    marginBottom: "0.75rem",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  sknTxtDate: {
    fontSize: "12px",
    color: "#999",
  },
  sknTxtInfo: {
    fontStyle: "italic",
    color: "#999",
  },
  sknFlightCardMain: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "1rem 1.5rem",
    marginBottom: "1rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    fontSize: "14px",
  },
  sknFlxflightDetails: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    gap: "2rem",
  },
  sknFlxTime: {
    textAlign: "center",
    minWidth: "60px",
  },
  sknTxtTime: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#333",
  },
  sknTxtCode: {
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
  sknFlxflightPath: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    minWidth: "400px",
  },
  sknDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#d0006f",
  },
  sknFlxLine: {
    width: "400px",
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
    gap: "6px",
  },
  sknTxtPrice: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#000",
  },

  sknFlxCoverImage: {
    width: "100%",
    height: "120px",
    objectFit: "cover",
    borderRadius: "6px",
    marginBottom: "0.5rem",
  },

  sknFlxNoCoverImage: {
    width: "100%",
    height: "120px",
    borderRadius: "6px",
    backgroundColor: "#f0f0f0",
    color: "#999",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "14px",
    marginBottom: "0.5rem",
  },

  sknTxtTripName: {
    fontWeight: "700",
    fontSize: "16px",
    color: "#333",
    marginBottom: "0.25rem",
  },
  sknFlxExport: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "1rem",
    marginTop: "1rem",
  },

  sknButton: {
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
};

export default Trips;
