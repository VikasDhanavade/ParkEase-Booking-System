async function run() {
    const res = await fetch(`http://localhost:5001/api/bookings/6a0c6cdd4c4431917c82747e/verify`);
    console.log('Status:', res.status);
    console.log('Headers:', res.headers);
    const text = await res.text();
    console.log('Body:', text.substring(0, 100));
}
run();
