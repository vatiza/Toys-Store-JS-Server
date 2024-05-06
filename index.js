const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
require("dotenv").config();
var jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ub65wqu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const jwtVerify = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESSTOKEN, function (error, decoded) {
    if (error) {
      return res.send({ error: true, message: "unauthorized" });
    }
    req.decoded = decoded;
    next();
  });
};

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect(); //await remove
    const toysCollection = client.db("toyStore").collection("toys");
    const ordersCollection = client.db("toyStore").collection("orders");

    app.get("/toys", async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });
    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });
    app.get("/orders", jwtVerify, async (req, res) => {
      const decoded = req.decoded;
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
    });

    // load only truck data
    app.get("/trucks", async (req, res) => {
      const query = { category: "truck" };
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });
    // load only cars data
    app.get("/cars", async (req, res) => {
      const query = { category: "cars" };
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });
    // load only patrol Cars data
    app.get("/patrols", async (req, res) => {
      const query = { category: "Patrol" };
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      res.send(result);
    });
    //! jwt accessToken
    app.post("/jwt", (req, res) => {
      const user = req.headers;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESSTOKEN, {
        expiresIn: "1h",
      });
      console.log(token);
      res.send({ token });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("The Toys store server is running");
});
app.listen(port, () => {
  console.log(`Toys server is running on port:${port}`);
});
