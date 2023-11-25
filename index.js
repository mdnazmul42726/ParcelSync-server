const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
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

        app.get('/user/v1', async (req, res) => {
            const query = { email: req.query.email };
            const result = await userCollection.findOne(query);
            res.send(result)
        });

        app.get('/books/v1', async (req, res) => {
            const query = { senderEmail: req.query.email };
            const result = await bookCollection.find(query).toArray();
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
