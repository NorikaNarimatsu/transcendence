////////////////// Backend test //////////////////


import { useEffect, useState } from 'react';

export function BackendTest() {
  const [status, setStatus] = useState<string>('Testing connection...');

  useEffect(() => {
    const testBackend = async () => {
      try {
        // Makes HTTP request to backend's health endpoint
        const response = await fetch('https://localhost:8443/health');

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


////////////////// Connection test //////////////////


interface Item {
  id: number;
  name: string;
}

export function ItemsList() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('https://localhost:8443/items');
        const data = await response.json();
        setItems(data);
      } catch (error) {
        setError('Failed to fetch items');
        console.error('Error:', error);
      }
    };

    fetchItems();
  }, []);

  return (
    <div>
      <h2>Items from Backend</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}