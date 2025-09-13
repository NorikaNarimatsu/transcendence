////////////////// Backend test //////////////////


import { useEffect, useState } from 'react';
import type { JSX } from 'react';


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

////////////////// Name validation test //////////////////
export function TEST() : JSX.Element{
  const [email, setEmail] = useState(''); //name state variable contains input value
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  try {
    const response = await fetch('https://localhost:8443/signup_validate_email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
     },
      body: JSON.stringify({ email }),
  });

    const data = await response.json();
    setMessage(data.message);
    if (response.ok) {
      setMessage('Yaaay');
      return (<div>Yaaay</div>); // Clear input on success
    }
  } catch (error) {
      setMessage('Failed to submit name');
      return (<div>Nayyyy</div>); // Clear input on success
    }
  };
}



// export function NameTest() {
//   const [name, setName] = useState(''); //name state variable contains input value
//   const [message, setMessage] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     try {
//       // fetch() creates HTTPS POST request (Request includes headers and body)
//       const response = await fetch('https://localhost:8443/validate-name', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ name }),
//       });

//       const data = await response.json();
//       setMessage(data.message);
//       if (response.ok) {
//         setName(''); // Clear input on success
//       }
//     } catch (error) {
//       setMessage('Failed to submit name');
//     }
//   };

//   return (
//     <div>
//       <h2>Name Validation Test</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="Enter your name"
//         />
//         <button type="submit">Submit</button>
//       </form>
//       {message && <p>{message}</p>}
//     </div>
//   );
// }