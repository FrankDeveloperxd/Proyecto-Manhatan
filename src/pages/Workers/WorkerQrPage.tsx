import React from 'react';
import { useParams } from 'react-router-dom';

export default function WorkerQrPage() {
  const { id } = useParams();
  // carga datos del trabajador si hace falta (fetch con credentials include)
  // muestra QR y la URL limpia (relativa)
  const url = `${window.location.origin}/ficha-worker/${id}`;
  return (
    <div>
      {/* componente QR (puedes reutilizar lo que ya tienes en modal) */}
      <h3>QR del trabajador</h3>
      <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=200x200`} alt="QR"/>
      <p>{url}</p>
    </div>
  );
}
