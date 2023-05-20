const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, MongoAWSError, ObjectId } = require('mongodb');

require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

//jwt
const jwt = require('jsonwebtoken');



//mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oth2isl.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();


    const toysCollection = client.db('bricksUniverseDB').collection('toys')
    const categoriesCollection = client.db('bricksUniverseDB').collection('categories')



    //jwt
    app.post('/jwt', (req,res)=>{
      console.log('reached');
      const user = req.body;
     
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3h'})
     
      res.send({token});
    })






    //categories CRUD
    //READ all categories
    app.get('/categories', async (req, res) => {
      const result = await categoriesCollection.find().toArray();
      res.send(result)
    })

  
    
  //READ get all toys
  app.get('/allToys', async (req, res) => {
     
    const query = {}
    const cursor = toysCollection.find(query).limit(20)
    const result = await cursor.toArray()
    
    res.send(result)
  })
  


    //read a specific category toy
    app.get('/toys', async (req, res) => {
     
      let query = {}
      if (req.query.sub_category) {
        query = { sub_category: req.query.sub_category }
      }
      const result = await toysCollection.find(query).toArray()
      
      res.send(result)
    })

    //READ a specific toy by id
    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query)
      res.send(result)
    })

  

    //get toys added by a specific seller
    app.get('/userAddedToys', async (req, res) => {

      let query = {};
    
      if (req.query.seller_email) {
        query = { seller_email: req.query.seller_email }
      }
      const result = await toysCollection.find(query).sort({price: 1}).toArray()
     
      res.send(result)

    })

    //update a specific toy
    app.put('/updateToy/:id', async (req, res) => {
      const id = req.params.id;
      const toy = req.body;

      const filter = { _id: new ObjectId(id) }

      const updateToy = {
        $set: {
          price: toy.price,
          quantity: toy.quantity,
          description: toy.description,
          sub_category: toy.sub_category
        }
      }

      const result = await toysCollection.updateOne(filter, updateToy);

      res.send(result);
    })


    //delete a toy
    app.delete('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(query)
      
      res.send(result)
    })




    //CREATE a toy

    app.post('/toy', async (req, res) => {
      const toy = req.body;
      const result = await toysCollection.insertOne(toy)
      res.send(result)
    })



    //sort my toys based on price(ascending or descending)
    //
    app.post('/toyPriceWise', async (req, res) => {

      let query;

      if(req.query.seller_email){
        query = {seller_email: req.query.seller_email}
      }
      const body = req.body
      const flag = body.tag
      
      let result;
      if(flag ==1){
        result = await toysCollection.find(query).sort({price: 1}).toArray()
      }
      else{
        result = await toysCollection.find(query).sort({price: -1}).toArray()
      }

      res.send(result);

    })


    //search in by toy_name

    //creating index
    const indexKey = {toyName:1}; //actual field name in which we want to index

    const indexOptions = {name: "toy_name_index"} // after index the field name will be toy_name_index

    const result = await toysCollection.createIndex(indexKey,indexOptions);


    //search api
    app.get('/searchAllToys/:search_toy_name', async (req,res)=>{
      const search_toy_name = req.params.search_toy_name;
      let query;
      if(search_toy_name){
        query = {toyName: {$regex: search_toy_name, $options:'i'}}
      }
      const result = await toysCollection.find(query).toArray();
      
     /*  const result = await toysCollection.find(
        {toyName: {$regex: search_toy_name, $options:'i'}}

        ).toArray() */
       
      res.send(result);

    })




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
  res.send('bricks universe is running');
})

app.listen(port, () => {
  console.log(`bricks universe is running at port: ${port}`);
})


