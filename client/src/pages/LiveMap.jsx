// src/pages/LiveMap.jsx
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import {
  MapPin,
  Clock,
  AlertTriangle,
  Settings,
  Navigation,
  X,
  Check,
  Users,
  Route,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { useNotifications } from "../contexts/NotificationContext";

const SOCKET_URL = "http://localhost:4000";
const API_URL = "http://localhost:4000/api";

export default function LiveMap() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const groupId = params.get("groupId");
  const [socket, setSocket] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [members, setMembers] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [destination, setDestination] = useState(null);
  const [destinationModalOpen, setDestinationModalOpen] = useState(false);
  const [newDestination, setNewDestination] = useState({
    name: "",
    lat: "",
    lng: "",
  });
  const [placeSearch, setPlaceSearch] = useState("");
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [memberETAs, setMemberETAs] = useState({}); // Store ETA for each member
  const [memberRoutes, setMemberRoutes] = useState({}); // Store routes for each member { userId: { coordinates: [...], color: '...' } }
  const [showMemberRoutes, setShowMemberRoutes] = useState(true); // Toggle to show/hide member routes
  const [currentUserId, setCurrentUserId] = useState(null); // Current user's ID
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [directionsPanelOpen, setDirectionsPanelOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false); // Track if map is ready
  const mapRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const { addNotification } = useNotifications();

  // Custom icons
  const userIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
    iconSize: [35, 35],
  });
  const friendIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [35, 35],
  });

  // 📏 Distance calculator
  const haversineDistance = (a, b) => {
    if (!a || !b) return null;
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const hav =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return R * 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
  };

  // 🚗 Calculate ETA based on distance (fallback when API fails)
  const calculateFallbackETA = (distanceKm) => {
    if (!distanceKm || distanceKm <= 0) return null;
    // Average driving speed: 50 km/h in city, 80 km/h on highway
    // Using weighted average: 60 km/h
    const avgSpeedKmh = 60;
    const etaMinutes = Math.round((distanceKm / avgSpeedKmh) * 60);
    return etaMinutes > 0 ? `${etaMinutes} min` : null;
  };

  // Sort members by proximity to current user
  const sortedMembers = useMemo(() => {
    return members
      .filter((m) => m.lat && m.lng)
      .sort((a, b) => {
        if (!userLocation) return 0;
        const da =
          haversineDistance(userLocation, { lat: a.lat, lng: a.lng }) || 0;
        const db =
          haversineDistance(userLocation, { lat: b.lat, lng: b.lng }) || 0;
        return da - db;
      });
  }, [members, userLocation]);

  // 🧭 Fetch route - defined early so it can be used in useEffect
  const fetchRouteInfo = useCallback(
    async (lat, lng) => {
      if (!destination || !destination.lat || !destination.lng) return;
      try {
        const res = await axios.post(`${API_URL}/route`, {
          origin: { lat, lng },
          destination: { lat: destination.lat, lng: destination.lng },
        });
        const data = res.data;
        if (data) {
          setRouteInfo({ distance: data.distance, duration: data.duration });
          if (data.coordinates) {
            setRouteCoords(data.coordinates);
          }
        }
      } catch {
        // If API fails, use fallback distance-based calculation
        try {
          const distance = haversineDistance(
            { lat, lng },
            { lat: destination.lat, lng: destination.lng }
          );
          if (distance) {
            const fallbackETA = calculateFallbackETA(distance);
            setRouteInfo({
              distance: `${distance.toFixed(2)} km`,
              duration: fallbackETA || "N/A",
            });
            // Draw a straight line as fallback route
            setRouteCoords([
              [lat, lng],
              [destination.lat, destination.lng],
            ]);
          }
        } catch {
          // Silently fail - route info will not be shown
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [destination]
  );

  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await axios.get(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userId = res.data.user?._id || res.data.user?.id;
          setCurrentUserId(userId);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch group info
  useEffect(() => {
    const fetchGroupInfo = async () => {
      if (!groupId) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAdmin(res.data.isAdmin || false);
        if (res.data.group.destination) {
          setDestination(res.data.group.destination);
        }
      } catch (err) {
        console.error("Error fetching group info:", err);
      }
    };
    fetchGroupInfo();
  }, [groupId]);

  // 🧠 Connect to socket and join group
  useEffect(() => {
    if (!groupId) {
      toast.error("No group selected for Live Map.");
      navigate("/groups");
      return;
    }

    const token = localStorage.getItem("token");
    const s = io(SOCKET_URL, { auth: { token } });
    setSocket(s);

    s.emit("joinGroup", { groupId });

    // Receive live updates
    s.on("groupLocations", (payload) => {
      setMembers(payload || []);
    });

    s.on("groupMembers", (payload) => {
      setMembers(payload || []);
    });

    // Listen for SOS alerts
    s.on("sosAlert", (alert) => {
      toast.error(`🚨 SOS Alert: ${alert.userName} needs help!`, {
        duration: 10000,
        icon: "🚨",
      });
      // Optionally show SOS marker on map
    });

    return () => {
      s.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // 🛰️ Watch user's own location
  useEffect(() => {
    if (!socket || !groupId) return;
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });
        socket.emit("locationUpdate", { groupId, lat, lng });
        if (
          destination &&
          destination.lat &&
          destination.lng &&
          !routeCoords.length
        ) {
          fetchRouteInfo(lat, lng);
        }
      },
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [socket, groupId, destination, routeCoords.length, fetchRouteInfo]);

  // Update route when destination changes
  useEffect(() => {
    if (destination && destination.lat && destination.lng && userLocation) {
      fetchRouteInfo(userLocation.lat, userLocation.lng);
    }
  }, [destination, userLocation, fetchRouteInfo]);

  // Search places
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (placeSearch.length < 2) {
      setPlaceSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/route/search-places`, {
          params: { q: placeSearch },
        });
        setPlaceSuggestions(res.data || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Error searching places:", err);
        setPlaceSuggestions([]);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [placeSearch]);

  // Generate unique color for each member
  const getMemberColor = (userId) => {
    const colors = [
      "#ef4444", // red
      "#f59e0b", // amber
      "#10b981", // emerald
      "#3b82f6", // blue
      "#8b5cf6", // violet
      "#ec4899", // pink
      "#14b8a6", // teal
      "#f97316", // orange
      "#06b6d4", // cyan
      "#84cc16", // lime
    ];
    // Use userId to consistently assign colors
    const index = parseInt(userId?.slice(-1) || "0", 16) % colors.length;
    return colors[index];
  };

  // Calculate ETA and routes for each member to destination (with debouncing and error handling)
  useEffect(() => {
    if (!destination || !destination.lat || !destination.lng || !members.length)
      return;

    // Debounce to avoid too many API calls
    const timeoutId = setTimeout(async () => {
      const etas = {};
      const routes = {};
      const validMembers = members.filter(
        (m) =>
          m.lat &&
          m.lng &&
          !isNaN(parseFloat(m.lat)) &&
          !isNaN(parseFloat(m.lng)) &&
          parseFloat(m.lat) >= -90 &&
          parseFloat(m.lat) <= 90 &&
          parseFloat(m.lng) >= -180 &&
          parseFloat(m.lng) <= 180
      );

      // Process in batches to avoid rate limiting
      const batchSize = 3;
      for (let i = 0; i < validMembers.length; i += batchSize) {
        const batch = validMembers.slice(i, i + batchSize);

        await Promise.allSettled(
          batch.map(async (member) => {
            try {
              const res = await axios.post(
                `${API_URL}/route`,
                {
                  origin: {
                    lat: parseFloat(member.lat),
                    lng: parseFloat(member.lng),
                  },
                  destination: {
                    lat: parseFloat(destination.lat),
                    lng: parseFloat(destination.lng),
                  },
                },
                { timeout: 10000 } // 10 second timeout
              );
              if (res.data) {
                if (res.data.duration) {
                  etas[member.userId] = res.data.duration;
                }
                // Store route coordinates for this member
                if (res.data.coordinates && res.data.coordinates.length > 0) {
                  routes[member.userId] = {
                    coordinates: res.data.coordinates,
                    color: getMemberColor(member.userId),
                    name: member.name || "Unknown",
                  };
                }
              }
            } catch {
              // If API fails, use fallback distance-based calculation
              try {
                const distance = haversineDistance(
                  { lat: parseFloat(member.lat), lng: parseFloat(member.lng) },
                  {
                    lat: parseFloat(destination.lat),
                    lng: parseFloat(destination.lng),
                  }
                );
                if (distance) {
                  const fallbackETA = calculateFallbackETA(distance);
                  if (fallbackETA) {
                    etas[member.userId] = fallbackETA;
                  }
                  // Create fallback route (straight line)
                  routes[member.userId] = {
                    coordinates: [
                      [parseFloat(member.lat), parseFloat(member.lng)],
                      [
                        parseFloat(destination.lat),
                        parseFloat(destination.lng),
                      ],
                    ],
                    color: getMemberColor(member.userId),
                    name: member.name || "Unknown",
                  };
                }
              } catch {
                // Silently fail - member will not have ETA or route
              }
            }
          })
        );

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < validMembers.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      setMemberETAs(etas);
      setMemberRoutes(routes);
    }, 1000); // Debounce by 1 second

    return () => clearTimeout(timeoutId);
  }, [destination, members]);

  // 🚗 Carpool Detection: Check if members can carpool together
  const [carpoolSuggestions, setCarpoolSuggestions] = useState([]);
  const carpoolCheckedRef = useRef(new Set()); // Track checked pairs to avoid duplicates

  // Check if a point is on/near a route
  const isPointOnRoute = (point, routeCoords, thresholdKm = 2) => {
    if (!routeCoords || routeCoords.length < 2) return null;

    let minDistance = Infinity;
    let closestPoint = null;
    let closestIndex = -1;

    // Check distance to each segment of the route
    for (let i = 0; i < routeCoords.length - 1; i++) {
      const p1 = { lat: routeCoords[i][0], lng: routeCoords[i][1] };
      const p2 = { lat: routeCoords[i + 1][0], lng: routeCoords[i + 1][1] };

      // Calculate distance from point to line segment
      const dist = pointToLineDistance(point, p1, p2);
      if (dist < minDistance) {
        minDistance = dist;
        closestPoint = {
          lat: (p1.lat + p2.lat) / 2,
          lng: (p1.lng + p2.lng) / 2,
        };
        closestIndex = i;
      }
    }

    if (minDistance <= thresholdKm) {
      return { point: closestPoint, distance: minDistance };
    }
    return null;
  };

  // Calculate distance from point to line segment
  const pointToLineDistance = (point, lineStart, lineEnd) => {
    const A = point.lat - lineStart.lat;
    const B = point.lng - lineStart.lng;
    const C = lineEnd.lat - lineStart.lat;
    const D = lineEnd.lng - lineStart.lng;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = lineStart.lat;
      yy = lineStart.lng;
    } else if (param > 1) {
      xx = lineEnd.lat;
      yy = lineEnd.lng;
    } else {
      xx = lineStart.lat + param * C;
      yy = lineStart.lng + param * D;
    }

    const dx = point.lat - xx;
    const dy = point.lng - yy;
    const distanceKm = haversineDistance(point, { lat: xx, lng: yy });
    return distanceKm;
  };

  // Detect carpool opportunities
  useEffect(() => {
    if (!destination || !memberRoutes || Object.keys(memberRoutes).length < 2) {
      return;
    }

    const suggestions = [];
    const checkedPairs = new Set();

    const memberArray = Object.entries(memberRoutes);
    
    // Compare each pair of members
    for (let i = 0; i < memberArray.length; i++) {
      for (let j = i + 1; j < memberArray.length; j++) {
        const [userId1, route1] = memberArray[i];
        const [userId2, route2] = memberArray[j];

        // Create a unique key for this pair
        const pairKey = [userId1, userId2].sort().join("-");
        if (checkedPairs.has(pairKey)) continue;
        checkedPairs.add(pairKey);

        // Skip if either route is invalid
        if (!route1.coordinates || !route2.coordinates || 
            route1.coordinates.length < 2 || route2.coordinates.length < 2) {
          continue;
        }

        // Get member info
        const member1 = members.find(m => m.userId === userId1);
        const member2 = members.find(m => m.userId === userId2);

        if (!member1 || !member2 || !member1.lat || !member1.lng || 
            !member2.lat || !member2.lng) {
          continue;
        }

        // Check if member1's location is on member2's route
        const member1OnRoute2 = isPointOnRoute(
          { lat: parseFloat(member1.lat), lng: parseFloat(member1.lng) },
          route2.coordinates,
          2 // 2km threshold
        );

        // Check if member2's location is on member1's route
        const member2OnRoute1 = isPointOnRoute(
          { lat: parseFloat(member2.lat), lng: parseFloat(member2.lng) },
          route1.coordinates,
          2 // 2km threshold
        );

        if (member1OnRoute2) {
          // Member1 can join member2's route
          const meetupPoint = member1OnRoute2.point;
          suggestions.push({
            member1Id: userId1,
            member1Name: member1.name || "Member 1",
            member2Id: userId2,
            member2Name: member2.name || "Member 2",
            meetupLocation: `${meetupPoint.lat.toFixed(4)}, ${meetupPoint.lng.toFixed(4)}`,
            meetupLat: meetupPoint.lat,
            meetupLng: meetupPoint.lng,
            distance: member1OnRoute2.distance,
            type: "member1_on_route2",
          });
        } else if (member2OnRoute1) {
          // Member2 can join member1's route
          const meetupPoint = member2OnRoute1.point;
          suggestions.push({
            member1Id: userId1,
            member1Name: member1.name || "Member 1",
            member2Id: userId2,
            member2Name: member2.name || "Member 2",
            meetupLocation: `${meetupPoint.lat.toFixed(4)}, ${meetupPoint.lng.toFixed(4)}`,
            meetupLat: meetupPoint.lat,
            meetupLng: meetupPoint.lng,
            distance: member2OnRoute1.distance,
            type: "member2_on_route1",
          });
        }
      }
    }

    // Only add new suggestions that haven't been notified yet
    const newSuggestions = suggestions.filter(s => {
      const key = `${s.member1Id}-${s.member2Id}`;
      return !carpoolCheckedRef.current.has(key);
    });

    if (newSuggestions.length > 0) {
      newSuggestions.forEach(suggestion => {
        const key = `${suggestion.member1Id}-${suggestion.member2Id}`;
        carpoolCheckedRef.current.add(key);

        // Send notification to current user if they're involved
        const currentUserIdStr = currentUserId?.toString();
        
        if (suggestion.member1Id === currentUserIdStr) {
          // Notify current user about member2
          addNotification({
            type: "carpool",
            title: "🚗 Carpool Opportunity!",
            message: `You and ${suggestion.member2Name} can carpool together from ${suggestion.meetupLocation}`,
            memberId: suggestion.member2Id,
            memberName: suggestion.member2Name,
            meetupLocation: suggestion.meetupLocation,
            meetupLat: suggestion.meetupLat,
            meetupLng: suggestion.meetupLng,
            groupId,
            timestamp: new Date(),
            read: false,
          });
        } else if (suggestion.member2Id === currentUserIdStr) {
          // Notify current user about member1
          addNotification({
            type: "carpool",
            title: "🚗 Carpool Opportunity!",
            message: `You and ${suggestion.member1Name} can carpool together from ${suggestion.meetupLocation}`,
            memberId: suggestion.member1Id,
            memberName: suggestion.member1Name,
            meetupLocation: suggestion.meetupLocation,
            meetupLat: suggestion.meetupLat,
            meetupLng: suggestion.meetupLng,
            groupId,
            timestamp: new Date(),
            read: false,
          });
        }
      });

      setCarpoolSuggestions(prev => [...prev, ...newSuggestions]);
    }
  }, [memberRoutes, members, destination, socket, groupId, currentUserId]);

  // Update destination (admin only)
  const handleUpdateDestination = async () => {
    if (!isAdmin) {
      toast.error("Only admins can set destination");
      return;
    }

    if (!newDestination.name || !newDestination.lat || !newDestination.lng) {
      toast.error("Please select a place from suggestions");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_URL}/groups/${groupId}/destination`,
        {
          destination: {
            name: newDestination.name,
            lat: parseFloat(newDestination.lat),
            lng: parseFloat(newDestination.lng),
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDestination(res.data.group.destination);
      setDestinationModalOpen(false);
      setNewDestination({ name: "", lat: "", lng: "" });
      setPlaceSearch("");
      setPlaceSuggestions([]);
      toast.success("Destination updated successfully!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update destination"
      );
    }
  };

  const handlePlaceSelect = (place) => {
    setNewDestination({
      name: place.name,
      lat: place.lat.toString(),
      lng: place.lng.toString(),
    });
    setPlaceSearch(place.name);
    setShowSuggestions(false);
  };

  // Label for names
  const NameLabel = ({ name, lat, lng }) => {
    const map = useMap();
    const labelRef = useRef(null);

    useEffect(() => {
      if (!map) return;
      const div = L.divIcon({
        html: `<div style="
          background: rgba(255,255,255,0.9);
          padding: 2px 6px;
          border-radius: 6px;
          border: 1px solid #ddd;
          color: #2563eb;
          font-size: 12px;
          font-weight: 600;
        ">${name}</div>`,
        className: "",
      });
      const marker = L.marker([lat, lng], { icon: div }).addTo(map);
      labelRef.current = marker;
      return () => {
        if (labelRef.current) map.removeLayer(labelRef.current);
      };
    }, [map, name, lat, lng]);

    return null;
  };

  // 🚀 Floating actions
  const shareMapLink = () => {
    const link = `${window.location.origin}/live-map?groupId=${groupId}`;
    navigator.clipboard.writeText(link);
    toast.success("📍 Map link copied to clipboard!");
  };

  // Open Google Maps with directions
  const openGoogleMapsDirections = () => {
    if (!destination || !destination.lat || !destination.lng) {
      toast.error("No destination set!");
      return;
    }

    if (!userLocation || !userLocation.lat || !userLocation.lng) {
      toast.error("Your location is not available. Please wait...");
      return;
    }

    // Google Maps directions URL format
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const dest = `${destination.lat},${destination.lng}`;

    // Using Google Maps Directions API URL format
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;

    // Open in new tab
    window.open(googleMapsUrl, "_blank");
    toast.success("🗺️ Opening Google Maps directions...");
  };

  if (!userLocation) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-cyan-300">Getting your live location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-gray-100 overflow-hidden">
      {/* Sidebar Toggle Button - Always Visible */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-20 right-4 z-50 bg-cyan-600 text-white p-3 rounded-full shadow-lg hover:bg-cyan-700 transition-all flex items-center gap-2"
        >
          <Users size={20} />
          <span className="text-sm font-semibold">Members</span>
        </button>
      )}

      {/* 🧭 Sidebar */}
      <aside
        className={`fixed top-16 right-0 h-[calc(100vh-64px)] w-80 z-50 bg-white/95 backdrop-blur-md border-l border-cyan-400/30 shadow-xl transform transition-transform duration-300 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Fixed Header */}
        <div className="p-4 border-b bg-gradient-to-r from-cyan-600 to-teal-500 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Group Members</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          {destination && (
            <div className="mt-2 text-xs bg-white/20 px-2 py-1 rounded">
              🎯 {destination.name || "Destination set"}
              {routeInfo && (
                <div className="mt-1 text-xs opacity-90">
                  📍 {routeInfo.distance} • ⏱️ {routeInfo.duration}
                </div>
              )}
            </div>
          )}
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {/* Route Legend */}
          {showMemberRoutes &&
            destination &&
            Object.keys(memberRoutes).length > 0 && (
              <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-semibold text-slate-600 mb-2">
                  Route Colors:
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-0.5 bg-cyan-500"></div>
                    <span className="text-slate-600">You (solid blue)</span>
                  </div>
                  {Object.entries(memberRoutes).map(([userId, routeData]) => {
                    const member = members.find((m) => m.userId === userId);
                    if (!member || userId === currentUserId?.toString())
                      return null;
                    return (
                      <div
                        key={userId}
                        className="flex items-center gap-2 text-xs"
                      >
                        <div
                          className="w-4 h-0.5 border-dashed border-2"
                          style={{ borderColor: routeData.color }}
                        ></div>
                        <span className="text-slate-600">
                          {routeData.name || "Member"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {sortedMembers.map((m) => {
            const memberRoute = memberRoutes[m.userId];
            const isCurrentUser = m.userId === currentUserId?.toString();

            return (
              <div
                key={m.userId}
                className={`flex items-start gap-3 p-3 rounded-xl shadow-sm border transition-all ${
                  m.routeDeviation
                    ? "bg-red-50 border-red-200"
                    : "bg-white/70 hover:bg-cyan-50 border-cyan-50"
                }`}
              >
                <div className="relative">
                  <img
                    src={
                      m.avatar ||
                      "https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
                    }
                    alt="avatar"
                    className="h-10 w-10 rounded-full ring-2 ring-cyan-200 object-cover"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${
                      m.isOnline
                        ? "bg-green-400 ring-2 ring-white"
                        : "bg-gray-300"
                    }`}
                  ></span>
                  {/* Route color indicator */}
                  {showMemberRoutes && memberRoute && !isCurrentUser && (
                    <div
                      className="absolute -top-1 -left-1 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: memberRoute.color }}
                      title={`${m.name}'s route`}
                    ></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-sm text-cyan-800 truncate">
                      {m.name || "Unknown"}
                      {isCurrentUser && (
                        <span className="text-xs text-cyan-600 ml-1">
                          (You)
                        </span>
                      )}
                    </div>
                    {m.routeDeviation && (
                      <AlertTriangle
                        size={14}
                        className="text-red-500 flex-shrink-0"
                      />
                    )}
                  </div>
                  {userLocation && m.lat && m.lng && (
                    <div className="text-xs text-cyan-600">
                      {haversineDistance(userLocation, {
                        lat: m.lat,
                        lng: m.lng,
                      }).toFixed(1)}{" "}
                      km away
                    </div>
                  )}
                  {destination &&
                    destination.lat &&
                    destination.lng &&
                    m.lat &&
                    m.lng && (
                      <div className="flex items-center gap-1 text-xs text-teal-600 mt-1">
                        <Clock size={12} />
                        <span>
                          {memberETAs[m.userId]
                            ? `ETA by car: ${memberETAs[m.userId]}`
                            : m.eta > 0
                            ? `ETA: ${m.eta} min`
                            : "Calculating..."}
                        </span>
                      </div>
                    )}
                  {m.routeDeviation && (
                    <div className="text-xs text-red-600 mt-1 font-medium">
                      ⚠️ Off-route
                    </div>
                  )}
                  {/* Route status */}
                  {showMemberRoutes && memberRoute && !isCurrentUser && (
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: memberRoute.color }}
                      ></div>
                      <span>Route shown</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* 🗺️ Map */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          style={{ height: "100vh", width: "100%" }}
          whenCreated={(map) => {
            mapRef.current = map;
            setMapReady(true);
            console.log("Map is ready!");
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />

          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>You are here</Popup>
          </Marker>

          {members
            .filter((m) => m.lat && m.lng)
            .map((m) => (
              <React.Fragment key={m.userId}>
                <Marker position={[m.lat, m.lng]} icon={friendIcon}>
                  <Popup>
                    <strong>{m.name || "Unknown"}</strong>
                    <br />
                    {m.email || "No email"}
                    {destination && m.eta > 0 && (
                      <>
                        <br />
                        <span className="text-teal-600">
                          ⏱️ ETA: {m.eta} min
                        </span>
                      </>
                    )}
                    {m.routeDeviation && (
                      <>
                        <br />
                        <span className="text-red-600">⚠️ Off-route</span>
                      </>
                    )}
                  </Popup>
                </Marker>
                <NameLabel name={m.name} lat={m.lat} lng={m.lng} />
              </React.Fragment>
            ))}

          {/* Destination marker */}
          {destination && destination.lat && destination.lng && (
            <>
              <Marker
                position={[destination.lat, destination.lng]}
                icon={friendIcon}
              >
                <Popup>
                  <strong>🎯 Destination</strong>
                  <br />
                  {destination.name || "Destination"}
                </Popup>
              </Marker>

              {/* Your route (blue) */}
              {routeCoords.length > 0 && (
                <Polyline
                  positions={routeCoords}
                  color="#06b6d4"
                  weight={5}
                  opacity={0.95}
                />
              )}

              {/* All members' routes (different colors) */}
              {showMemberRoutes &&
                Object.entries(memberRoutes).map(([userId, routeData]) => {
                  // Don't show route if it's the current user (they have their own blue route)
                  const member = members.find((m) => m.userId === userId);
                  if (!member || userId === currentUserId?.toString())
                    return null;

                  return (
                    <Polyline
                      key={`route-${userId}`}
                      positions={routeData.coordinates}
                      color={routeData.color}
                      weight={4}
                      opacity={0.7}
                      dashArray="5, 5"
                    />
                  );
                })}
            </>
          )}
        </MapContainer>
      </div>

      {/* Floating Action Menu */}
      <div
        className="fixed bottom-6 z-50 flex flex-col gap-3 items-end transition-all duration-300"
        style={{ right: sidebarOpen ? "21rem" : "1.5rem" }}
      >
        {actionMenuOpen && (
          <div className="flex flex-col gap-2 mb-2 transition-all duration-200">
            {isAdmin && (
              <button
                onClick={() => setDestinationModalOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg flex items-center gap-2"
              >
                🎯 Set Destination
              </button>
            )}
            <button
              onClick={shareMapLink}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg flex items-center gap-2"
            >
              🔗 Share Map
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg flex items-center gap-2"
            >
              👥 Members
            </button>
            {destination && (
              <button
                onClick={() => setShowMemberRoutes(!showMemberRoutes)}
                className={`px-4 py-2 rounded-full shadow-md hover:shadow-lg flex items-center gap-2 ${
                  showMemberRoutes
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                }`}
                title={
                  showMemberRoutes ? "Hide member routes" : "Show member routes"
                }
              >
                <Route size={14} />{" "}
                {showMemberRoutes ? "Hide Routes" : "Show Routes"}
              </button>
            )}

            {destination && (
              <>
                <button
                  onClick={() => setDirectionsPanelOpen(!directionsPanelOpen)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Navigation size={14} /> Directions
                </button>
                <button
                  onClick={openGoogleMapsDirections}
                  className="bg-gradient-to-r from-teal-500 to-green-500 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg flex items-center gap-2"
                  title="Open Google Maps directions"
                >
                  <Navigation size={14} /> Open in Google Maps
                </button>
              </>
            )}
          </div>
        )}

        <button
          onClick={() => setActionMenuOpen((prev) => !prev)}
          className={`bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:bg-cyan-700 hover:shadow-2xl transition-transform duration-200 ${
            actionMenuOpen ? "rotate-45 scale-110" : ""
          }`}
        >
          <MapPin size={22} />
        </button>
      </div>

      {/* Directions Panel */}
      <AnimatePresence>
        {directionsPanelOpen && destination && userLocation && (
          <motion.div
            className="fixed left-4 top-20 bottom-20 w-96 max-w-[90vw] bg-white/95 backdrop-blur-md rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-cyan-400/30"
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="flex items-center gap-3">
                <Navigation size={24} />
                <div>
                  <h3 className="text-lg font-semibold">Directions</h3>
                  {destination && (
                    <p className="text-sm text-white/90">
                      To: {destination.name || "Destination"}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setDirectionsPanelOpen(false)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Route Info */}
            {routeInfo ? (
              <div className="px-6 py-4 bg-slate-50 border-b border-cyan-50">
                <div className="flex items-center gap-6 mb-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Route size={18} className="text-purple-500" />
                    <span className="font-semibold text-lg">
                      {routeInfo.distance}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock size={18} className="text-pink-500" />
                    <span className="font-semibold text-lg">
                      {routeInfo.duration}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-600">
                  Route calculated from your current location
                </div>
              </div>
            ) : (
              <div className="px-6 py-4 bg-slate-50 border-b border-cyan-50">
                <div className="text-sm text-slate-600">
                  Calculating route...
                </div>
              </div>
            )}

            {/* Route Details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              <div className="space-y-3">
                {/* Start Point */}
                <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                  <div className="mt-1">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-cyan-700 uppercase">
                      Start
                    </div>
                    <div className="text-sm text-slate-800 mt-1">
                      Your Current Location
                    </div>
                    {userLocation && (
                      <div className="text-xs text-slate-500 mt-1">
                        {userLocation.lat.toFixed(4)},{" "}
                        {userLocation.lng.toFixed(4)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Route Line */}
                {routeCoords.length > 0 && (
                  <div className="flex items-center gap-3 px-3">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-cyan-500 to-purple-500 ml-1.5"></div>
                    <div className="text-xs text-slate-400">
                      {routeCoords.length} route points
                    </div>
                  </div>
                )}

                {/* End Point */}
                {destination && (
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="mt-1">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-purple-700 uppercase">
                        Destination
                      </div>
                      <div className="text-sm text-slate-800 mt-1">
                        {destination.name || "Destination"}
                      </div>
                      {destination.lat && destination.lng && (
                        <div className="text-xs text-slate-500 mt-1">
                          {destination.lat.toFixed(4)},{" "}
                          {destination.lng.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2">
                <button
                  onClick={openGoogleMapsDirections}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
                  title="Open in Google Maps"
                >
                  <Navigation size={16} /> Open in Google Maps
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Destination Modal */}
      <AnimatePresence>
        {destinationModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDestinationModalOpen(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 p-6 w-96 max-w-[90vw]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-teal-700">
                  Set Destination
                </h3>
                <button
                  onClick={() => {
                    setDestinationModalOpen(false);
                    setPlaceSearch("");
                    setPlaceSuggestions([]);
                    setNewDestination({ name: "", lat: "", lng: "" });
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Place
                  </label>
                  <input
                    type="text"
                    value={placeSearch}
                    onChange={(e) => {
                      setPlaceSearch(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Type place name (e.g., Pune, Goa Beach)"
                    className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    autoComplete="off"
                  />
                  {showSuggestions && placeSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto scrollbar-hide">
                      {placeSuggestions.map((place, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePlaceSelect(place)}
                          className="w-full text-left px-4 py-3 hover:bg-cyan-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-sm text-gray-800">
                            {place.name.split(",")[0]}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {place.name.split(",").slice(1, 3).join(",")}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {showSuggestions &&
                    placeSearch.length >= 2 &&
                    placeSuggestions.length === 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-500">
                        No places found. Try a different search.
                      </div>
                    )}
                </div>
                {newDestination.name && (
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                    <div className="text-sm font-medium text-teal-800">
                      Selected: {newDestination.name.split(",")[0]}
                    </div>
                    <div className="text-xs text-teal-600 mt-1">
                      Coordinates: {newDestination.lat}, {newDestination.lng}
                    </div>
                  </div>
                )}
                <button
                  onClick={handleUpdateDestination}
                  disabled={
                    !newDestination.name ||
                    !newDestination.lat ||
                    !newDestination.lng
                  }
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={18} /> Set Destination
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
