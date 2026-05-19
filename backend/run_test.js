import mongoose from 'mongoose'; mongoose.connect('mongodb://localhost:27017/parking_db').then(() => console.log('Connected')).catch(e=>console.log(e));
