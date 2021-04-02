const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
const cors = require('cors');
const bodeParser = require('body-parser');
require('dotenv').config()

const port = process.env.PORT || 5000

app.use(cors());
app.use(bodeParser.json());

console.log(process.env.DB_USER);

app.get('/', (req, res) => {
  res.send("Hello from db it's working")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3fo4t.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('connection err', err);
  const productCollection = client.db("ponnoBilash").collection("products");
  const ordersCollection = client.db("ponnoBilash").collection("orders");

  app.get('/orders', (req, res) => {
    ordersCollection.find({email: req.query.email})
    .toArray((err, items) => {
      res.send(items)
    })
  })

  app.get('/products', (req, res) => {
    productCollection.find()
    .toArray((err, items) => {
      res.send(items)
    })
  })

  app.get('/product/:id', (req, res) => {
    productCollection.find({_id: ObjectId(req.params.id)})
    .toArray((err, items) => {
      res.send(items[0])
    })
  })

  app.post('/addProduct', (req, res) => {
    const newProduct = req.body;
    productCollection.insertOne(newProduct)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

  app.post('/addOrder', (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

//   client.close();
});


app.listen(process.env.PORT || port)