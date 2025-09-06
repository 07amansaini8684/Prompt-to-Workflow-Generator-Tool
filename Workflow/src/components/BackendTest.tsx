import React, { useEffect, useState } from 'react';

export const BackendTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing...');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const testBackend = async () => {
      try {
        console.log('[BackendTest] Testing backend connection...');
        
        // Test health endpoint
        const healthResponse = await fetch('http://localhost:3000/health');
        const healthData = await healthResponse.json();
        console.log('[BackendTest] Health check response:', healthData);
        
        // Test if userId exists in localStorage
        const storedId = localStorage.getItem('userId');
        setUserId(storedId || 'No userId found');
        console.log('[BackendTest] Stored userId:', storedId);
        
        if (storedId) {
          // Test user API call
          console.log('[BackendTest] Testing user API call...');
          const userResponse = await fetch(`http://localhost:3000/api/users/${storedId}`);
          const userData = await userResponse.json();
          console.log('[BackendTest] User API response:', userData);
          
          if (userResponse.ok) {
            setStatus('Backend OK - User found');
          } else {
            setStatus('Backend OK - User not found');
          }
        } else {
          setStatus('Backend OK - No userId to test');
        }
        
      } catch (error) {
        console.error('[BackendTest] Error testing backend:', error);
        setStatus('Backend Error - ' + error.message);
      }
    };

    testBackend();
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-black border border-neutral-800 rounded-lg p-4 text-white text-sm z-50">
      <div className="font-bold mb-2">Backend Test</div>
      <div>Status: {status}</div>
      <div>UserId: {userId}</div>
    </div>
  );
}; 