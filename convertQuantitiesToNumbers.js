// convertQuantitiesToNumbers.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.lhnyl9u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri);

async function convertQuantitiesToNumbers() {
    try {
        await client.connect();
        const db = client.db('B2BWholeSell');
        const collection = db.collection('products');

        const result = await collection.updateMany(
            {
                $or: [
                    { main_quantity: { $type: "string" } },
                    { Minimum_selling_quantity: { $type: "string" } }
                ]
            },
            [
                {
                    $set: {
                        main_quantity: {
                            $cond: {
                                if: { $eq: [{ $type: "$main_quantity" }, "string"] },
                                then: { $toInt: "$main_quantity" },
                                else: "$main_quantity"
                            }
                        },
                        Minimum_selling_quantity: {
                            $cond: {
                                if: { $eq: [{ $type: "$Minimum_selling_quantity" }, "string"] },
                                then: { $toInt: "$Minimum_selling_quantity" },
                                else: "$Minimum_selling_quantity"
                            }
                        }
                    }
                }
            ]
        );

        console.log('✅ Conversion complete:', result.modifiedCount, 'documents updated');
    } catch (error) {
        console.error('❌ Error converting fields:', error);
    } finally {
        await client.close();
    }
}

convertQuantitiesToNumbers();
