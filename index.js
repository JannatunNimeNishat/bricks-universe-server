const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, MongoAWSError } = require('mongodb');

require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

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



    //categories CRUD
    //READ all categories
    app.get('/categories', async(req,res)=>{
      const result = await categoriesCollection.find().toArray();
      res.send(result)
    })



  //Toys CRUD

  
  //read a specific category toy
  app.get('/toys', async (req,res)=>{
    console.log(req.query);
    let query = {}
    if(req.query.sub_category){
      query = {sub_category:req.query.sub_category}
    }
    const result = await toysCollection.find(query).toArray()
    res.send(result)
    // console.log(query);
  })
  
  //READ get all toys
  app.get('/toys', async(req,res)=>{
    const result = await toysCollection.find().toArray()
    res.send(result)
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








app.get('/', (req,res)=>{
    res.send('bricks universe is running');
})

app.listen(port, ()=>{
    console.log(`bricks universe is running at port: ${port}`);
})


