const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const bodeParser = require("body-parser");
require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodeParser.json());

app.get("/", (req, res) => {
  res.send("Hello from db it's working");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3fo4t.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  console.log("connection err", err);
  const productsCollection = client.db("ponnoBilash").collection("products");
  const ordersCollection = client.db("ponnoBilash").collection("orders");
  const adminsCollection = client.db("ponnoBilash").collection("admins");
  const reviewsCollection = client.db("ponnoBilash").collection("reviews");

  app.get("/ordersByEmail", (req, res) => {
    ordersCollection.find({ email: req.query.email }).toArray((err, items) => {
      res.send(items);
    });
  });

  app.get("/orders", (req, res) => {
    ordersCollection.find({}).toArray((err, items) => {
      res.send(items);
    });
  });

  app.get("/products", (req, res) => {
    productsCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  app.get("/product/:id", (req, res) => {
    productsCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, items) => {
        res.send(items[0]);
      });
  });

  app.post("/addProduct", (req, res) => {
    const newProduct = req.body;
    productsCollection.insertOne(newProduct).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/search", (req, res) => {
    const key = new RegExp(req.query.q, "i");
    productsCollection.find({ name: key }).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/productsByIds", (req, res) => {
    const productIds = req.body;
    productsCollection
      .find({ _id: { $in: productIds } })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.post("/addReview", (req, res) => {
    const review = req.body;
    reviewsCollection
      .find({ email: review.email })
      .toArray((err, documents) => {
        if (documents.length > 0) {
          res.send(false);
        } else {
          reviewsCollection.insertOne(review).then((result) => {
            res.send(result.acknowledged);
          });
        }
      });
  });

  app.get("/reviews", (req, res) => {
    reviewsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.delete("/deleteReview/:id", (req, res) => {
    reviewsCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        console.log(result);
      });
  });

  app.post("/addOrder", (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/addAdmin", (req, res) => {
    const admin = req.body;
    adminsCollection.insertOne(admin).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminsCollection.find({ email: email }).toArray((er, admins) => {
      res.send(admins.length > 0);
    });
  });

  app.delete("/deleteOrder/:id", (req, res) => {
    ordersCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        console.log(result);
      });
  });

  app.patch("/updateOrder/:_id", (req, res) => {
    const UpdatedValues = req.body;
    console.log(UpdatedValues);
    ordersCollection
      .updateOne(
        { _id: ObjectId(req.params._id) },
        { $set: { status: UpdatedValues.status } }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
        console.log("updated!");
        console.log(result);
      });
  });

  app.put("/updateProduct/:_id", (req, res) => {
    const UpdatedValues = req.body;
    productsCollection
      .updateOne(
        { _id: ObjectId(req.params._id) },
        {
          $set: {
            isAvailable: UpdatedValues.isAvailable,
            name: UpdatedValues.name,
            price: UpdatedValues.price,
            imageUrl: UpdatedValues.imageUrl,
          },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
        console.log("updated!");
        console.log(result);
      });
  });

  app.delete("/deleteProduct/:id", (req, res) => {
    productsCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        console.log(result);
      });
  });

  //   client.close();
});

app.listen(process.env.PORT || port);
