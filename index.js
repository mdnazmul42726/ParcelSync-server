const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:kB9BxRKOeKO2r1oV@cluster0.nfeux5q.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } });

async function run() {
    try {
        await client.connect();

        const userCollection = client.db("assignment_12_DB").collection("users");
        const bookCollection = client.db("assignment_12_DB").collection("books");

        app.get('/users/v1', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result)
        })

        app.get('/books/count/v1', async (req, res) => {
            const booked = await bookCollection.find().toArray();
            const delivered = booked.filter(item => item.status == 'Delivered');
            const totalDelivered = delivered.length
            const totalBookedCount = await bookCollection.estimatedDocumentCount();
            const totalUser = await userCollection.estimatedDocumentCount();
            res.send({ totalBookedCount, totalDelivered, totalUser });
        });

        app.get('/user/v1', async (req, res) => {
            const query = { email: req.query.email };
            const result = await userCollection.findOne(query);
            res.send(result)
        });

        app.get('/books/v2', async (req, res) => {
            const result = await bookCollection.find().toArray();
            res.send(result)
        });

        app.get('/books/v1', async (req, res) => {
            let query = { senderEmail: req.query.email }
            if (req.query.status) {
                query = { senderEmail: req.query.email, status: req.query.status }
            };
            const result = await bookCollection.find(query).toArray();
            res.send(result);
        });

        app.get('/book/edit/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookCollection.findOne(query);
            res.send(result);
        });

        app.get('/user/delivery-man', async (req, res) => {
            const query = { accType: 'Delivery Man' };
            const result = await userCollection.find(query).toArray();
            res.send(result);

        });

        app.post('/users/v1', async (req, res) => {
            const user = req.body;
            const query = { email: req.body.email };
            const isExist = await userCollection.findOne(query);
            if (isExist) {
                return res.send({ message: 'user Exist' })
            };
            const result = userCollection.insertOne(user);
            res.send(result);
        });

        app.post('/book/v1', async (req, res) => {
            const bookData = req.body;
            const result = await bookCollection.insertOne(bookData);
            res.send(result);
        });

        app.patch('/book/update/v1/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: { status: 'Cancelled' }
            };
            const result = await bookCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        app.patch('/user/update', async (req, res) => {
            const email = req.query.email;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: { name: req.body.name, gender: req.body.gender, currentAddress: req.body.currentAddress, permanentAddress: req.body.permanentAddress, contactNumber: req.body.contactNumber }
            };
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.patch('/book/item/update', async (req, res) => {
            const id = req.query.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    senderPhoneNumber: req.body.senderPhoneNumber,
                    parcelType: req.body.parcelType,
                    parcelWeight: req.body.parcelWeight,
                    RequestedDeliveryDate: req.body.RequestedDeliveryDate,
                    receiverEmail: req.body.receiverEmail,
                    receiverName: req.body.receiverName,
                    ReceiverPhoneNumber: req.body.ReceiverPhoneNumber,
                    deliveryAddress: req.body.deliveryAddress,
                    deliveryAddressLatitude: req.body.deliveryAddressLatitude,
                    deliveryAddressLongitude: req.body.deliveryAddressLongitude,
                    price: req.body.price,
                }
            };
            const result = await bookCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        });

        app.patch('/user/role/v1', async (req, res) => {
            const id = req.query.id;
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: { accType: req.query.role }
            };
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result)
        })

        app.delete('/book/delete/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await bookCollection.deleteOne(filter);
            res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => res.send('ParcelSync server is running'))
app.listen(port, () => console.log('ParcelSync server is running on port', port));
