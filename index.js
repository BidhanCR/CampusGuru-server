const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }

  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ugnln4i.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    const collegeCollection = client.db("campusGuruDb").collection("colleges");
    const reviewCollection = client.db("campusGuruDb").collection("reviews");
    const usersCollection = client.db("campusGuruDb").collection("users");
    const AdmissionCollection = client.db("campusGuruDb").collection("admission");

    // JWT token
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "3h",
      });

      res.send({ token });
    });

    
    // colleges

    app.get("/colleges", async (req, res) => {
      const query = {};
      const result = await collegeCollection
        .find(query)
        .toArray();
      res.send(result);
    });
    app.get("/college", async (req, res) => {
      const query = {};
      const result = await collegeCollection
        .find(query)
        .limit(3)
        .toArray();
      res.send(result);
    });
    app.get("/reviews", async (req, res) => {
      const query = {};
      const result = await reviewCollection
        .find(query)
        .limit(3)
        .toArray();
      res.send(result);
    });


     
    // users

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "user already exists" });
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/profile/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email
        : email };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    // admission

    app.post("/admission", async(req, res)=> {
      const admissionData = req.body;
      const result = await AdmissionCollection.insertOne(admissionData);
      res.send(result);
    })

    app.get("/admission/:email", async (req, res) => {
      const email = req.params.email;
      const query = { candidateEmail
        : email };
      const result = await AdmissionCollection.find(query).toArray();
      res.send(result);
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
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
