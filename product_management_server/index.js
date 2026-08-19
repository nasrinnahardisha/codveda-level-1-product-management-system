const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri =
  "mongodb+srv://productDBUser:v8VcYcNmZaeAtSbC@cluster0.jdtyh.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("productDB").collection("products");

    // READ All Products (GET)
    app.get("/api/products", async (req, res) => {
      try {
        const products = await productCollection
          .find()
          .sort({ _id: -1 })
          .toArray();
        res.status(200).json(products);
      } catch (err) {
        res
          .status(500)
          .json({
            message: "Server error fetching products",
            error: err.message,
          });
      }
    });

    // READ Single Product (GET)
    app.get("/api/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const product = await productCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!product)
          return res.status(404).json({ message: "Product not found" });
        res.status(200).json(product);
      } catch (err) {
        res.status(400).json({ message: "Invalid Product ID format" });
      }
    });

    // CREATE Product (POST)
    app.post("/api/products", async (req, res) => {
      try {
        const { title, category, price, status, description } = req.body;
        if (!title || !price) {
          return res
            .status(400)
            .json({ message: "Title and price are required!" });
        }
        const newProduct = {
          title,
          category,
          price: Number(price),
          status,
          description,
        };
        const result = await productCollection.insertOne(newProduct);
        res.status(201).json({ _id: result.insertedId, ...newProduct });
      } catch (err) {
        res
          .status(500)
          .json({ message: "Failed to create product", error: err.message });
      }
    });

    // UPDATE Product (PUT)
    app.put("/api/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            title: updatedData.title,
            category: updatedData.category,
            price: Number(updatedData.price),
            status: updatedData.status,
            description: updatedData.description,
          },
        };
        const result = await productCollection.updateOne(filter, updateDoc);
        if (result.matchedCount === 0)
          return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product updated successfully" });
      } catch (err) {
        res
          .status(500)
          .json({ message: "Error updating product", error: err.message });
      }
    });

    // DELETE Product (DELETE)
    app.delete("/api/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await productCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0)
          return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product deleted successfully" });
      } catch (err) {
        res
          .status(500)
          .json({ message: "Error deleting product", error: err.message });
      }
    });

    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("REST API is running...");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
