fetch('http://localhost:5001/api/bookings/invalid-id/verify')
    .then(res => res.json())
    .then(data => console.log('Invalid:', data))
    .catch(console.error);

fetch('http://localhost:5001/api/bookings/me', { headers: { Authorization: 'Bearer ' } }) // wait, don't have token
