const express = require("express");
const app = express();
const cors = require("cors");
var jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config()

app.use(cors());
app.use(express.json());

// MongoDB Start
// https://assignment-12-server-three-nu.vercel.app/
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.mbbwdlc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const database = client.db("healthCare");
    const users = database.collection("users");
    const reviews = database.collection("reviews");
    const addBanner = database.collection("addBanner");
    const allTests = database.collection("allTests");
    const allAppointed = database.collection("appointed");

    // Token Verify
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'Unauthorize access' })
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorize access' })
        }
        req.decoded = decoded;
        next();
      })
    }


    //JWT API
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_ACCESS_TOKEN, {
        expiresIn: "1h"
      })
      res.send(token);
    })

    //API
    app.get("/users", verifyToken, async (req, res) => {
      const allUser = await users.find().toArray();
      res.send(allUser);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const result = await users.findOne(query);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await users.insertOne(user);
      res.send(result);
    });
    app.patch("/users/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateData = {
        $set: {
          status: "Block"
        }
      }
      const result = await users.updateOne(query, updateData);
      res.send(result);
    });

      app.patch("/users/usrUpdate/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const data = req.body;
      const updateData = {
        $set: {
          name:data?.name,
          email:data?.email,
          upazila:data?.upazila,
          profile:data?.profile,
          district:data?.district,
          blood:data?.blood,
        }
      }
      const result = await users.updateOne(query, updateData);
      res.send(result);
    });

    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await users.findOne(query);
      const admin = (user?.isAdmin);
      res.send(admin);
    });

    app.get("/reviews", async (req, res) => {
      const result = await reviews.find().toArray();
      res.send(result);
    });

    app.get("/addBanner", async (req, res) => {
      const addData = await addBanner.find().toArray();
      res.send(addData);
    });

    app.post("/addBanner", async (req, res) => {
      const bannerInfo = req.body;
      const result = await addBanner.insertOne(bannerInfo);
      res.send(result);
    });

    app.get("/allTests", async (req, res) => {
      const tests = await allTests.find().toArray();
      res.send(tests)
    });

    app.get('/allTests/tests', async(req, res)=>{
      const filter = req.query;
      const query = {testDate:filter.sort };
      const result = await allTests.find(query).toArray();
      res.send(result);
    })

    app.get("/allTests/bookingTest/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allTests.findOne(query);
      res.send(result)
    });

    app.post("/allTests", async (req, res) => {
      const addTest = req.body;
      const result = await allTests.insertOne(addTest);
      res.send(result);
    });

    app.delete('/allTests/delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allTests.deleteOne(query);
      res.send(result);
    });

    app.patch("/allTests/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const currentData = await allTests.findOne(query);
      const updateData = {
        $set: {
          testSlots: (currentData?.testSlots -1)
        }
      }
      const result = await allTests.updateOne(query, updateData);
      res.send(result);
    });

    app.patch("/allTests/updatemany/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const data = req.body;
      const updateData = {
        $set: {
          testName: data.testName,
          testDetails: data.testDetails,
          testPrice: data.testPrice,
          testSlots: data.testSlots,
          testDate: data.testDate,
        }
      }
      const result = await allTests.updateOne(query, updateData);
      res.send(result);
    });

    app.patch("/addBanner/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateData = {
        $set: {
          isActive: true
        }
      }
      const result = await addBanner.updateOne(query, updateData);
      res.send(result);
    });

    app.delete('/addBanner/delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addBanner.deleteOne(query);
      res.send(result);
    });

    app.get('/appointed', async(req, res) => {
      const result = await allAppointed.find().toArray();
      res.send(result);
    })
    
    app.post("/appointed", async (req, res) => {
      const data = req.body;
      const retult = await allAppointed.insertOne(data);
      res.send(retult);
    });

    app.get("/appointed/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await allAppointed.find(query).toArray();
      res.send(result);
    });

    app.get('/appointed/email', async(req, res)=>{
      const filter = req.query;
      const query = { email: filter.sort };
      const result = await allAppointed.find(query).toArray();
      res.send(result);
    })

    app.patch("/appointed/updateReport/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const data = req.body;
      const updateData = {
        $set: {
          testReport: data?.testReport,
          status: data?.status,
        }
      }
      const result = await allAppointed.updateOne(query, updateData);
      res.send(result);
    });

    app.delete('/appointed/delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allAppointed.deleteOne(query);
      res.send(result);
    });


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
// MongoDb End

app.get("/", (req, res) => {
  res.send("This is homepage!");
});
app.listen(port, () => {
  console.log(`Server is running at ${port}`)
});