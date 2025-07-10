import {
   CreateTableCommand,
   type CreateTableCommandInput,
   DescribeTableCommand,
   DynamoDBClient,
   ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb";
import {
   DeleteCommand,
   DynamoDBDocumentClient,
   GetCommand,
   PutCommand,
   UpdateCommand,
   type UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = "UsersTable";
const LOCAL_DYNAMODB_ENDPOINT = "http://localhost:8000";

// 1. Configure the DynamoDB Client to connect to the local instance
const client = new DynamoDBClient({
   region: "localhost", // Use any region for local, 'localhost' is common
   endpoint: LOCAL_DYNAMODB_ENDPOINT,
   // Provide dummy credentials as they are not used by the local instance,
   // but the SDK requires them.
   credentials: {
      accessKeyId: "dummy",
      secretAccessKey: "dummy",
   },
});

// 2. Create the Document Client for easier data manipulation
const docClient = DynamoDBDocumentClient.from(client);

// --- Helper function to check if a table exists ---
async function tableExists(tableName: string): Promise<boolean> {
   try {
      await client.send(new DescribeTableCommand({ TableName: tableName }));
      console.log(`Table '${tableName}' already exists.`);
      return true;
   } catch (error) {
      if (error instanceof ResourceNotFoundException) {
         console.log(`Table '${tableName}' does not exist.`);
         return false;
      }
      console.error(`Error checking table existence for '${tableName}':`, error);
      throw error;
   }
}

// --- Function to create a table ---
async function createUsersTable() {
   if (await tableExists(TABLE_NAME)) {
      return; // Table already exists, no need to recreate
   }

   console.log(`Creating table '${TABLE_NAME}'...`);
   const params: CreateTableCommandInput = {
      TableName: TABLE_NAME,
      KeySchema: [
         { AttributeName: "userId", KeyType: "HASH" }, // Partition key
      ],
      AttributeDefinitions: [
         { AttributeName: "userId", AttributeType: "S" }, // String type for userId
      ],
      ProvisionedThroughput: {
         ReadCapacityUnits: 5,
         WriteCapacityUnits: 5,
      },
   };

   try {
      const data = await client.send(new CreateTableCommand(params));
      console.log("Table created successfully:", data.TableDescription?.TableName);
   } catch (err) {
      console.error("Error creating table:", err);
   }
}

// --- Function to put (create/overwrite) an item ---
async function putUser(userId: string, name: string, email: string) {
   console.log(`\nPutting user: ${userId}`);
   const params = {
      TableName: TABLE_NAME,
      Item: {
         userId,
         name,
         email,
         createdAt: new Date().toISOString(),
      },
   };
   try {
      await docClient.send(new PutCommand(params));
      console.log("User put successfully.");
   } catch (err) {
      console.error("Error putting user:", err);
   }
}

// --- Function to get an item ---
async function getUser(userId: string) {
   console.log(`\nGetting user: ${userId}`);
   const params = {
      TableName: TABLE_NAME,
      Key: {
         userId,
      },
   };
   try {
      const data = await docClient.send(new GetCommand(params));
      if (data.Item) {
         console.log("User found:", data.Item);
         return data.Item;
      }
      console.log("User not found.");
      return null;
   } catch (err) {
      console.error("Error getting user:", err);
      return null;
   }
}

// --- Function to update an item ---
async function updateUserEmail(userId: string, newEmail: string) {
   console.log(`\nUpdating user ${userId} email to ${newEmail}`);
   const params: UpdateCommandInput = {
      TableName: TABLE_NAME,
      Key: {
         userId,
      },
      UpdateExpression: "SET email = :e",
      ExpressionAttributeValues: {
         ":e": newEmail,
      },
      ReturnValues: "ALL_NEW",
   };
   try {
      const data = await docClient.send(new UpdateCommand(params));
      console.log("User updated successfully:", data.Attributes);
   } catch (err) {
      console.error("Error updating user:", err);
   }
}

// --- Function to delete an item ---
async function deleteUser(userId: string) {
   console.log(`\nDeleting user: ${userId}`);
   const params = {
      TableName: TABLE_NAME,
      Key: {
         userId,
      },
   };
   try {
      await docClient.send(new DeleteCommand(params));
      console.log("User deleted successfully.");
   } catch (err) {
      console.error("Error deleting user:", err);
   }
}

// --- Main execution function ---
export async function runDdbScenario() {
   //    try {
   // 1. Create the table (if it doesn't exist)
   await createUsersTable();

   // 2. Put a new user
   await putUser("101", "Alice Smith", "alice@example.com");

   // 3. Get the user
   await getUser("101");

   // 4. Update the user's email
   await updateUserEmail("101", "alice.updated@example.com");

   // 5. Get the updated user
   await getUser("101");

   // 6. Delete the user
   //   await deleteUser("101");

   // 7. Try to get the deleted user (should be null)
   //   await getUser("101");

   // Optional: Delete the table when done
   // console.log(`\nDeleting table '${TABLE_NAME}'...`);
   // await client.send(new DeleteTableCommand({ TableName: TABLE_NAME }));
   // console.log(`Table '${TABLE_NAME}' deleted successfully.`);
   //    } catch (error) {
   //   console.error("An unhandled error occurred in main:", error);
   //    } finally {
   // It's good practice to destroy the client if your application is exiting
   // but typically you keep it open for the life of the application.
   // client.destroy();
   //    }
}
