import { useEffect, useState } from 'react';

export function BackendTest() {
  const [status, setStatus] = useState<string>('Testing connection...');

  useEffect(() => {
    const testBackend = async () => {
      try {
        // Makes HTTP request to backend's health endpoint
        const response = await fetch('http://localhost:8443/health');

        // parses JSON response
        const data = await response.json();

        // Updates status based on response
        setStatus(`Backend Status: ${data.status}`);
      } catch (error) {
        setStatus(`Connection Error: ${error}`); // Handles errors
      }
    };

    testBackend();
  }, []);

  return (
    <div>
      <h2>Backend Connection Test</h2>
      <p>{status}</p>
    </div>
  );
}