const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
app.use(
    cors({
        origin: [
            "https://cosmic-belekoy-92f929.netlify.app",
            "http://localhost:5173",
            "http://localhost:5174",
        ],
    })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.uruvxpx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        const database = client.db('DNSBD');
        const DnsCollection = database.collection('dsn');
        const userCollection = database.collection('user');
        // await client.connect();
        const verifyToken = (req, res, next) => {
            if (!req.headers.authorization) {
                return res.status(401).send({ message: "forbidden access" })
            }
            const token = req.headers.authorization.split(" ")[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: "forbidden access" })
                }
                req.decoded = decoded;
                next()
            })
        };
//jwt token-->
app.post('/jwt', async(req, res) => {
    // console.log(req.headers)
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.send({ token })
})

        app.get('/domain', async(req, res) => {
            const result = await DnsCollection.find().toArray();
            res.send(result)
        });
        app.get('/domain/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await DnsCollection.findOne(query);
            res.send(result)
        });
        app.post('/domain',verifyToken, async(req, res) => {
            const domain = req.body;
            const result = await DnsCollection.insertOne(domain);
            res.send(result)
        });
        app.delete("/domain/:id", async(req, res) => {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await DnsCollection.deleteOne(query);
                res.send(result);
            });
            app.put("/domain/:id", async(req, res) => {
                const id = req.params.id;
                const domaininfo = req.body;
                const filter = { _id: new ObjectId(id) };
                const options = { upsert: true };
                const domain = {
                    $set: {
                        domain: domaininfo.domain,
                        date: domaininfo.date,
                        price: domaininfo.price,
                        details: domaininfo.details,
                        rating: domaininfo.rating,
                    },
                };
                const result = await DnsCollection.updateOne(
                    filter,
                    domain,
                    options
                );
                res.send(result);
            });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Hassa..........................................n')
})

app.listen(port, () => {
    console.log(`
Example app listening on port ${port}
`)
})