import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
   DeleteCommand,
   DynamoDBDocumentClient,
   GetCommand,
   PutCommand,
   QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { createDdbItem } from "./util";

type GetItemQuery<T> = {
   itemKey: { pk: string; sk: string };
   pickKeys?: (keyof T)[];
};

type GetItemsStarsWithQuery = {
   itemKey: { pk: string };
   startsWith?: string;
};

type PutItemQuery<T> = {
   key: { pk: string; sk: string };
   item?: T | undefined;
};

type DeleteItemQuery = {
   itemKey: { pk: string; sk: string };
};

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

export const createDdbAccess = (): DdbAccess => {
   const getItem = async <T>(query: GetItemQuery<T>): Promise<T | undefined> => {
      const { itemKey: key, pickKeys } = query;
      const command = new GetCommand({
         TableName: TABLE_NAME,
         Key: { PK: key.pk, SK: key.sk },
      });
      const result = await docClient.send(command);

      if (!result.Item) {
         return undefined;
      }

      if (!pickKeys) {
         return result.Item as T;
      }

      const filteredItem: Partial<T> = {};
      pickKeys.forEach((key) => {
         if (!result.Item) return;
         if (key in result.Item) {
            filteredItem[key] = result.Item[key as string];
         }
      });

      return filteredItem as T;
   };

   const getItems = async <T>(query: GetItemsStarsWithQuery): Promise<T[]> => {
      const { itemKey: key, startsWith } = query;

      const command = new QueryCommand({
         TableName: TABLE_NAME,
         KeyConditionExpression: "PK = :pk AND begins_with(SK, :starts_with)",
         ExpressionAttributeValues: {
            ":pk": key.pk,
            ":starts_with": startsWith || "",
         },
      });

      const result = await docClient.send(command);

      if (!result.Items || result.Items.length === 0) {
         return [];
      }
      return result.Items as T[];
   };

   const putItem = async <T>(query: PutItemQuery<T>): Promise<void> => {
      const { key, item } = query;
      const putItem = createDdbItem({ key: key, item: item || {} });
      const command = new PutCommand({ TableName: TABLE_NAME, Item: putItem });
      await docClient.send(command);
   };

   const deleteItem = async (query: DeleteItemQuery): Promise<void> => {
      const { itemKey: key } = query;
      const command = new DeleteCommand({
         TableName: TABLE_NAME,
         Key: { PK: key.pk, SK: key.sk },
      });
      await docClient.send(command);
   };

   return {
      getItem,
      getItems,
      putItem,
      deleteItem,
   };
};

export interface DdbAccess {
   getItem: <T>(query: GetItemQuery<T>) => Promise<T | undefined>;
   getItems: <T>(query: GetItemsStarsWithQuery) => Promise<T[]>;
   putItem: <T>(query: PutItemQuery<T>) => Promise<void>;
   deleteItem: (query: DeleteItemQuery) => Promise<void>;
}
