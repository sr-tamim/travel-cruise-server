const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json(JSON.stringify('Travel Cruise server is ready.!')));


const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

const uri = `mongodb+srv://${user}:${password}@cluster0.5isyw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const placesDB = client.db('placesDB');
        const placesCollection = placesDB.collection('places');
        const bookingsDB = client.db('bookingsDB');
        const bookingsCollection = bookingsDB.collection('bookings');

        // get all places
        app.get('/places', async (req, res) => {
            const cursor = placesCollection.find({});
            const places = await cursor.toArray();
            res.send(places);
        })

        // get all bookings
        app.get('/bookings', async (req, res) => {
            const cursor = bookingsCollection.find({});
            const bookings = await cursor.toArray();
            res.send(bookings);
        })

        // add booking to DB
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.json(result);
        })
        // delete booking to DB
        app.delete('/bookings/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.json(result);
        })
        // update booking info
        app.post('/booking/update/:id', async (req, res) => {
            const id = req.params.id;
            const updatedBooking = req.body;
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: { ...updatedBooking }
            }
            const options = { upsert: true };
            const result = await bookingsCollection.updateOne(query, updateDoc, options);
            res.json(result)
        })

        // get single booking details
        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingsCollection.findOne(query);
            res.send(booking);
        })


        // get single place details
        app.get('/place/:id', async (req, res) => {
            const id = req.params.id;
            const query = { placeID: parseInt(id) };
            const place = await placesCollection.findOne(query);
            res.send(place);
        })
        // add place to DB
        app.post('/places', async (req, res) => {
            const place = req.body;
            const result = await placesCollection.insertOne(place);
            res.json(result);
        })

        // get places by id for cart items
        app.post('/placesByID', async (req, res) => {
            const placeIDs = req.body;
            const filter = { placeID: { $in: placeIDs } };
            const result = await placesCollection.find(filter).toArray();
            res.json(result);
        })

    } finally { }
}

run().catch(console.dir);

app.listen(port, () => console.log(`http://localhost:${port}`));