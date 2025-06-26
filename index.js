const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const admin = require("firebase-admin");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const e = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// firebase admin sdk initialization

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  }),
});

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ error: "Unauthorized access" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // Attach the decoded user info to the request object
    next(); // Call the next middleware or route handler
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(403).send({ error: "Forbidden access" });
  }
};

// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.lhnyl9u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const B2BWholeSell = client.db("B2BWholeSell").collection("products");
    const PurchasesCollection = client
      .db("B2BWholeSell")
      .collection("purchases");

    // get all products
    app.get("/all-products", verifyJWT, async (req, res) => {
      // Optional: Match product email with Firebase authenticated user email
      if (req.user.email !== req.user.email) {
        return res
          .status(403)
          .send({ error: "Email mismatch. Forbidden access." });
      }
      const result = await B2BWholeSell.find().toArray();
      res.send(result);
    });

    // get data with specific category

    app.get("/products", async (req, res) => {
      const category = req.query.category;
      let filter = {};
      if (category) {
        filter = { category: category };
      }

      try {
        const products = await B2BWholeSell.find(filter).toArray();
        res.json(products);
      } catch (err) {
        res.status(500).json({ error: "Database query failed" });
      }
    });

    app.get("/products/available", async (req, res) => {
      try {
        const availableProducts = await B2BWholeSell.find({

          Minimum_selling_quantity: { $gt: 100 },
        }).toArray();

        res.status(200).send(availableProducts);
      } catch (error) {
        console.error("Error fetching available products:", error.message);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await B2BWholeSell.findOne(query);
      res.send(result);
    });

    // top rated products
    app.get("/top-rated-products", async (req, res) => {
      try {
        const productsCollection = client
          .db("B2BWholeSell")
          .collection("products");

        const topRated = await productsCollection
          .find({})
          .sort({ rating: -1 }) // highest to lowest rating
          .limit(20)
          .toArray();

        res.send(topRated);
      } catch (error) {
        console.error("Error fetching top-rated products:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // purchases
    app.get("/my-purchases", verifyJWT, async (req, res) => {
      const email = req.query.email;
      if (!email) return res.status(400).send({ error: "Email is required" });

      try {
        const purchases = await PurchasesCollection.find({
          buyerEmail: email,
        }).toArray();
        res.send(purchases);
      } catch (error) {
        console.error("Error fetching purchases:", error);
        res
          .status(500)
          .send({ error: "Internal Server Error", message: error.message });
      }
    });

    // popular-categories
    app.get("/popular-categories", async (req, res) => {
      try {
        const productsCollection = client
          .db("B2BWholeSell")
          .collection("products");

        const pipeline = [
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
              image: { $first: "$ImageURL" },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 6 },
        ];

        const result = await productsCollection.aggregate(pipeline).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching popular categories:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // get data with specific email

    app.get("/my-product", verifyJWT, async (req, res) => {
      const userEmail = req.query.email;
      if (userEmail !== req.user.email) {
        return res.status(403).send({ error: "Forbidden access" });
      }
      const query = userEmail ? { userEmail: userEmail } : {};
      const result = await B2BWholeSell.find(query).toArray();
      res.send(result);
    });

    // purchase route

    app.post("/purchase", async (req, res) => {
      try {
        let { productId, quantity, buyerName, buyerEmail } = req.body;

        // 1. Validate quantity
        quantity = Number(quantity);
        if (isNaN(quantity) || quantity <= 0) {
          return res.status(400).send({ error: "Invalid quantity value" });
        }

        // 2. Validate ObjectId
        if (!ObjectId.isValid(productId))
          return res.status(400).send({ error: "Invalid product ID" });

        // 3. Authorization: Match JWT email with buyerEmail
        // if (req.user.email !== buyerEmail) {
        //     return res.status(403).send({ error: "Email mismatch. Forbidden access." });
        // }

        // 4. Fetch product
        const product = await B2BWholeSell.findOne({
          _id: new ObjectId(productId),
        });
        if (!product)
          return res.status(404).send({ error: "Product not found" });

        // 5. Validate order quantity
        if (quantity < Number(product.minimum_order_quantity)) {
          return res
            .status(400)
            .send({
              error: `You must buy at least ${product.minimum_order_quantity} items.`,
            });
        }

        // 6. Update quantity
        const updateResult = await B2BWholeSell.updateOne(
          { _id: new ObjectId(productId) },
          { $inc: { main_quantity: -quantity } }
        );

        // 7. Record purchase
        if (updateResult.modifiedCount > 0) {
          await PurchasesCollection.insertOne({
            productId: new ObjectId(productId),
            quantity,
            buyerName,
            buyerEmail,
            purchaseDate: new Date(),
            productDetails: {
              name: product.name,
              image: product.ImageURL,
              category: product.category,
              brand: product.Brand_Name,
              minimum_order_quantity: product.Minimum_Order_Quantity,
              description: product.description,
              rating: product.Rating,
            },
          });

          return res.send({ message: "Purchase successful" });
        } else {
          return res
            .status(500)
            .send({ error: "Failed to update product quantity" });
        }
      } catch (error) {
        console.error("Error in /purchase route:", error);
        res
          .status(500)
          .send({ error: "Internal Server Error", message: error.message });
      }
    });

    app.post("/add-products", verifyJWT, async (req, res) => {
      const product = req.body;

      // Optional: Match product email with Firebase authenticated user email
      if (req.user.email !== req.user.email) {
        return res
          .status(403)
          .send({ error: "Email mismatch. Forbidden access." });
      }

      const result = await B2BWholeSell.insertOne(product);
      res.send(result);
    });

    // update data
    app.put("/products/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedData = req.body;
      const updatedDoc = {
        $set: updatedData,
      };
      const result = await B2BWholeSell.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // delete data
    app.delete("/cancel-purchase/:id", async (req, res) => {
      const purchaseId = req.params.id;

      if (!ObjectId.isValid(purchaseId)) {
        return res.status(400).send({ error: "Invalid purchase ID" });
      }

      try {
        // Step 1: Find the purchase entry
        const purchase = await PurchasesCollection.findOne({
          _id: new ObjectId(purchaseId),
        });

        if (!purchase) {
          return res.status(404).send({ error: "Purchase not found" });
        }

        const { productId, quantity } = purchase;

        // Step 2: Increment back the product's quantity
        const updateResult = await B2BWholeSell.updateOne(
          { _id: new ObjectId(productId) },
          { $inc: { main_quantity: quantity } }
        );

        if (updateResult.modifiedCount === 0) {
          return res
            .status(500)
            .send({ error: "Failed to restore product quantity" });
        }

        // Step 3: Delete the purchase record
        const deleteResult = await PurchasesCollection.deleteOne({
          _id: new ObjectId(purchaseId),
        });

        if (deleteResult.deletedCount > 0) {
          res.send({ message: "Purchase cancelled successfully" });
        } else {
          res.status(500).send({ error: "Failed to delete purchase" });
        }
      } catch (error) {
        console.error("Error in DELETE /cancel-purchase/:id:", error);
        res
          .status(500)
          .send({ error: "Internal Server Error", message: error.message });
      }
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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`hello world app listening on port ${port}`);
});
