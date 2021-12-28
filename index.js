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


const user = process.env.DB_USER;  // mongoDB user
const password = process.env.DB_PASSWORD;  // mongoDB password

const uri = `mongodb+srv://${user}:${password}@cluster0.5isyw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }); // mongoDB client

async function run() {
    try {
        // connect mongoDB client
        await client.connect();

        // tour places database
        const placesDB = client.db('placesDB');
        const placesCollection = placesDB.collection('places');

        // tour bookings info database
        const bookingsDB = client.db('bookingsDB');
        const bookingsCollection = bookingsDB.collection('bookings');

        // subscribers info database
        const subscriptionCollection = client.db('subscriptionsDB').collection('subscribers');

        // users info collection
        const usersCollection = client.db('usersCollection').collection('users');


        // get all tour places
        app.get('/places', async (req, res) => {
            const cursor = placesCollection.find({});
            const places = await cursor.toArray();
            res.send(places);
        })
        // add tour place to DB
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
        // get single tour place details
        app.get('/place/:id', async (req, res) => {
            const id = req.params.id;
            const query = { placeID: parseInt(id) };
            const place = await placesCollection.findOne(query);
            res.send(place);
        })


        // get all user bookings
        app.get('/bookings', async (req, res) => {
            const cursor = bookingsCollection.find({});
            const bookings = await cursor.toArray();
            res.send(bookings);
        })
        // add new tour booking to DB
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.json(result);
        })
        // delete tour booking from DB
        app.delete('/bookings/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.json(result);
        })
        // update tour booking info
        app.post('/booking/update/:id', async (req, res) => {
            const id = req.params.id;
            const updatedBooking = req.body;
            const query = { _id: ObjectId(id) };
            const updateDoc = { $set: { ...updatedBooking } }
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

        // add subscribers in database
        app.post('/subscription', async (req, res) => {
            const { subscriptionInfo } = req.body;
            const result = await subscriptionCollection.insertOne(subscriptionInfo);
            res.json(result);
        })
        // get all subscribers
        app.get('/subscribers', async (req, res) => {
            const cursor = subscriptionCollection.find({});
            const subscribers = await cursor.toArray();
            res.send(subscribers);
        })


        // save user info in database
        app.post('/users', async (req, res) => {
            const newUser = req.body
            const query = { email: newUser.email }
            const filter = await usersCollection.findOne(query)
            if (!filter || newUser.role === 'admin') {
                const updateDoc = { $set: { ...newUser } }
                const options = { upsert: true }
                const result = await usersCollection.updateOne(query, updateDoc, options)
                res.json(result)
            } else {
                res.json({ error: "User already added" })
            }
        })

        app.post('/isAdmin', async (req, res) => {
            const { email } = req.body
            const filter = await usersCollection.findOne({ email })
            res.json(filter?.role === 'admin')
        })

    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => console.log(`http://localhost:${port}`));