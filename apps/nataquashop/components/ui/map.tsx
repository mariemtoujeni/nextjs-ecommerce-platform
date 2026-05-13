"use client";

import { useEffect, useState } from "react";

interface MapProps {
  address: string;
  className?: string;
}

export function Map({ address, className = "" }: MapProps) {
  const [mapUrl, setMapUrl] = useState("");

  useEffect(() => {
    // Coordonnées de Jarnages, Haute-Vienne
    const lat = 45.85; // Latitude de Jarnages
    const lon = 1.55;  // Longitude de Jarnages
    
    // URL avec paramètres optimisés pour afficher le marker
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lon}&text=Nataquashop&scale=10000`;
    setMapUrl(url);
  }, [address]);

  if (!mapUrl) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-gray-500">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Localisation de Nataquashop"
        className="rounded-none"
      />
    </div>
  );
} 