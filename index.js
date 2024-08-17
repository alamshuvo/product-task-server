const express= require("express");
const cors=require('cors');
require('dotenv').config();
const app=express();
const port=process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.x9xlpou.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const productCollection=client.db('product').collection('ProductCollection')


    app.get("/product", async (req, res) => {
      try {
        const {
          page = 1,
          limit = 10,
          search = "",
          brand,
          category,
          minPrice,
          maxPrice,
          sortBy,
          sortOrder = "asc",
        } = req.query;
    console.log(brand);
        //  query object for filtering
        let query = {};

        if (search) {
          query.productName = { $regex: search, $options: "i" }; 
        }
        if (brand) {
          query.brandName = brand;
        }
        if (category) {
          query.category = category;
        }
        if (minPrice && maxPrice) {
          query.price = {
            $gte: parseFloat(minPrice),
            $lte: parseFloat(maxPrice),
          };
        }

        // Sorting options
        let sortOptions = {};
        if (sortBy) {
          sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1; 
        } else {
          sortOptions["creationDate"] = -1; 
        }

        // Pagination options
        const skip = (page - 1) * limit;

        const products = await productCollection
          .find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .toArray();

        const totalProducts = await productCollection.countDocuments(query);

        res.send({
          products,
          totalProducts,
          totalPages: Math.ceil(totalProducts / limit),
          currentPage: parseInt(page),
        });
      } catch (error) {
        res.status(500).send({ message: "Error", error });
      }
    });


      app.get("/productsCount",async(req,res)=>{
        const total =await productCollection.estimatedDocumentCount();
        res.send({total})
      })
    











    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    
  }
}
run().catch(console.dir);












app.get("/",(req,res)=>{
    res.send("product task server is running")
});
app.listen(port,()=>{
    console.log(`product server is running on port ${port}`);
})
