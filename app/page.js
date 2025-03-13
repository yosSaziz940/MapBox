"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";

const AddressAutofill = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.AddressAutofill),
  { ssr: false }
);

const Map = dynamic(() => import("react-map-gl"), { ssr: false });
let lastHighlightedBuildingId = null;
const MAPBOX_TOKEN = "pk.eyJ1IjoieW9zdGluYWF6aXoiLCJhIjoiY204NDc1cndyMXZtazJrczVwenR2d2Z5ciJ9.x-uEqhTb7_Btjw3LgBUhqQ";

export default function Home() {
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [bearing, setBearing] = useState(-20);
  const [pitch, setPitch] = useState(60);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);



  const geocodeAddress = async () => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
          address
        )}&access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
  
      if (data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        setLocation({ lat, lng });
  
        if (mapRef.current) {
          const map = mapRef.current.getMap();
  
          if (markerRef.current) {
            markerRef.current.remove();
          }
  
          markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
  
          map.flyTo({
            center: [lng, lat],
            zoom: 18,
            pitch: pitch,
            bearing: bearing,
          });
  
          const features = map.queryRenderedFeatures(
            map.project([lng, lat]),
            { layers: ["3d-buildings"] }
          );
  
          console.log("Buildings found:", features);
  
          if (features.length > 0) {
            console.log("Previous Highlighted Building ID:", lastHighlightedBuildingId);
  
           
            if (lastHighlightedBuildingId !== null) {
              console.log("Removing highlight from:", lastHighlightedBuildingId);
              map.removeFeatureState({
                source: "composite",
                sourceLayer: "building",
                id: Number(lastHighlightedBuildingId),
              });
            }
  
            let closestFeature = features[0];
            let minDistance = Number.MAX_VALUE;
  
            features.forEach((feature) => {
              const [featureLng, featureLat] = feature.geometry.coordinates[0][0]; 
              const distance = Math.sqrt(
                Math.pow(featureLng - lng, 2) + Math.pow(featureLat - lat, 2)
              );
  
              if (distance < minDistance) {
                minDistance = distance;
                closestFeature = feature;
              }
            });
  
         
            if (closestFeature.id !== undefined) {
              console.log("New highlighted building ID:", closestFeature.id);
              map.setFeatureState(
                { source: "composite", sourceLayer: "building", id: Number(closestFeature.id) },
                { highlighted: true }
              );
  
              lastHighlightedBuildingId = Number(closestFeature.id);
              console.log("Stored new highlight:", lastHighlightedBuildingId);
            } else {
              console.warn("Closest feature does not have a valid ID.");
              lastHighlightedBuildingId = null;
            }
          } else {
            console.log("No buildings found!");
            lastHighlightedBuildingId = null;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      alert("Failed to fetch location");
    }
  };
  
  


  const updateMapView = (newBearing, newPitch) => {
    setBearing(newBearing);
    setPitch(newPitch);
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      map.flyTo({ bearing: newBearing, pitch: newPitch });
    }
  };


  return (
    <div className="relative">
      <div className="absolute top-5 left-5 flex space-x-2 p-2 rounded z-10 backdrop-blur-lg bg-white/30 shadow-md">
        <AddressAutofill
          accessToken={MAPBOX_TOKEN}
          onRetrieve={(res) => {
            const fullAddress = res.features[0]?.properties.full_address || "";
            setAddress(fullAddress);
          }}
        >
          <input
            type="text"
            placeholder="Enter an address"
            autoComplete="address-line1"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="p-2 border rounded w-64 bg-transparent text-black placeholder-black focus:outline-none"
          />
        </AddressAutofill>
        <button onClick={geocodeAddress} className="bg-blue-500 text-white px-4 py-2 rounded">
          Search
        </button>
      </div>

      <div className="absolute bottom-10 right-5 flex flex-col space-y-2 z-10">
        <button onClick={() => mapRef.current?.getMap().zoomIn()} className="bg-gray-800 text-white p-3 rounded shadow-md">
          ➕
        </button>
        <button onClick={() => mapRef.current?.getMap().zoomOut()} className="bg-gray-800 text-white p-3 rounded shadow-md">
          ➖
        </button>
        <button onClick={() => updateMapView(bearing - 10, pitch)} className="bg-gray-800 text-white p-3 rounded shadow-md">
          ←
        </button>
        <button onClick={() => updateMapView(bearing + 10, pitch)} className="bg-gray-800 text-white p-3 rounded shadow-md">
          →
        </button>
        <button onClick={() => updateMapView(bearing, Math.min(pitch + 5, 85))} className="bg-gray-800 text-white p-3 rounded shadow-md">
          ↑
        </button>
        <button onClick={() => updateMapView(bearing, Math.max(pitch - 5, 0))} className="bg-gray-800 text-white p-3 rounded shadow-md">
          ↓
        </button>
      </div>

      <div className="w-full h-screen">
        {isClient && (
          <Map
            ref={mapRef}
            initialViewState={{
              longitude: location?.lng || -118.031,
              latitude: location?.lat || 33.977,
              zoom: 18,
              pitch: pitch,
              bearing: bearing,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            onLoad={(e) => {
              const map = e.target;

              if (!map.getLayer("3d-buildings")) {
                map.addLayer({
                  id: "3d-buildings",
                  source: "composite",
                  "source-layer": "building",
                  type: "fill-extrusion",
                  minzoom: 15,
                  paint: {
                    "fill-extrusion-color": [
                      "case",
                      ["boolean", ["feature-state", "highlighted"], false],
                      "#ff0000",
                      "#aaa",
                    ],
                    "fill-extrusion-height": ["get", "height"],
                    "fill-extrusion-opacity": 0.6,
                  },
                });
              }

              if (!map.getLayer("housenum-label")) {
                map.addLayer({
                  id: "housenum-label",
                  type: "symbol",
                  source: "composite",
                  "source-layer": "housenum_label",
                  minzoom: 19, 
                  layout: {
                    "text-field": ["get", "house_num"],
                    "text-size": 18,
                    "text-anchor": "center",
                    "text-allow-overlap": true,
                  },
                  paint: {
                    "text-color": "#000000",
                    "text-halo-color": "#ffffff",
                    "text-halo-width": 2,
                  },
                });
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

