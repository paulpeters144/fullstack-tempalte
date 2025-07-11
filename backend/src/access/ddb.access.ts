import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
   DynamoDBDocumentClient,
   GetCommand,
   PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { createDdbItem } from "./util";

const TABLE_NAME = "app-table";
const LOCAL_DYNAMODB_ENDPOINT = "http://localhost:8000";

const client = new DynamoDBClient({
   region: "localhost",
   endpoint: LOCAL_DYNAMODB_ENDPOINT,
   credentials: {
      accessKeyId: "dummy",
      secretAccessKey: "dummy",
   },
});

const docClient = DynamoDBDocumentClient.from(client);

export const createDdbAccess = () => {
   const getItem = async <T>(pk: string, sk?: string): Promise<T> => {
      const Key = { PK: pk, SK: sk };
      const command = new GetCommand({ TableName: TABLE_NAME, Key });
      const result = (await docClient.send(command)).Item as T;
      return result;
   };

   const putItem = async <T>(props: {
      key: { pk: string; sk: string };
      item?: T | undefined;
   }): Promise<void> => {
      const putItem = createDdbItem({ key: props.key, item: props.item || {} });
      const command = new PutCommand({ TableName: TABLE_NAME, Item: putItem });
      await docClient.send(command);
   };

   return {
      getItem,
      getPutItem: putItem,
   };
};
