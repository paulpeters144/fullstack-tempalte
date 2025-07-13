import { createDdbItem } from "@/src/access/util";
import type { Env } from "@/src/config/env";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
   DeleteCommand,
   DynamoDBDocumentClient,
   GetCommand,
   PutCommand,
   QueryCommand,
} from "@aws-sdk/lib-dynamodb";

type GetItemQuery<T> = {
   itemKey: { pk: string; sk: string };
   pickKeys?: (keyof T)[];
};

type GetItemsStarsWithQuery<T> = {
   itemKey: { pk: string };
   startsWith?: string;
   pickKeys?: (keyof T)[];
};

type PutItemQuery<T> = {
   key: { pk: string; sk: string };
   item?: T | undefined;
};

type DeleteItemQuery = {
   itemKey: { pk: string; sk: string };
};

export interface DdbAccess {
   getItem: <T>(query: GetItemQuery<T>) => Promise<T | undefined>;
   getItems: <T>(query: GetItemsStarsWithQuery<T>) => Promise<T[]>;
   putItem: <T>(query: PutItemQuery<T>) => Promise<void>;
   deleteItem: (query: DeleteItemQuery) => Promise<void>;
}

export const createDdbAccess = (env: Env): DdbAccess => {
   const { ddbTable } = env;
   const client = new DynamoDBClient(
      env.stage === "local"
         ? {
              region: "localhost",
              endpoint: "http://localhost:8000",
              credentials: {
                 accessKeyId: "dummy",
                 secretAccessKey: "dummy",
              },
           }
         : {},
   );

   const docClient = DynamoDBDocumentClient.from(client);

   const getItem = async <T>(query: GetItemQuery<T>): Promise<T | undefined> => {
      const { itemKey: key, pickKeys } = query;
      const command = new GetCommand({
         TableName: ddbTable,
         Key: { PK: key.pk, SK: key.sk },
      });
      const response = await docClient.send(command);

      if (!response.Item) {
         return undefined;
      }

      if (!pickKeys) {
         const result: Record<string, unknown> = {};
         Object.keys(response.Item).forEach((key) => {
            if (!response.Item) return;
            if (key === "PK" || key === "SK") return;
            result[key] = response.Item[key as string];
         });
         return result as T;
      }

      const filteredItem: Partial<T> = {};
      pickKeys.forEach((key) => {
         if (!response.Item) return;
         if (!(key in response.Item)) return;
         filteredItem[key] = response.Item[key as string];
      });

      return filteredItem as T;
   };

   const getItems = async <T>(query: GetItemsStarsWithQuery<T>): Promise<T[]> => {
      const { itemKey: key, startsWith, pickKeys } = query;

      let keyConditionExpression = "PK = :pk";
      const expressionAttributeValues: { [key: string]: string } = {
         ":pk": key.pk,
      };

      if (startsWith) {
         keyConditionExpression += " AND begins_with(SK, :starts_with)";
         expressionAttributeValues[":starts_with"] = startsWith;
      }

      const command = new QueryCommand({
         TableName: ddbTable,
         KeyConditionExpression: keyConditionExpression,
         ExpressionAttributeValues: expressionAttributeValues,
      });

      const response = await docClient.send(command);
      if (!response.Items) return [];

      if (pickKeys) {
         const result: Record<string, unknown>[] = [];
         const pickKeySet = new Set(pickKeys.map((t) => t.toString()));
         for (const item of response.Items) {
            const pickedItem: Record<string, unknown> = {};
            for (const k of Object.keys(item)) {
               if (!pickKeySet.has(k)) continue;
               pickedItem[k] = item[k as string];
            }

            if (Object.keys(pickedItem).length > 0) {
               result.push(pickedItem);
            }
         }
         return result as T[];
      }

      const result: Record<string, unknown>[] = [];
      for (const item of response.Items) {
         const resultItem: Record<string, unknown> = {};
         for (const k of Object.keys(item)) {
            if (k === "PK" || k === "SK") continue;
            resultItem[k] = item[k as string];
         }
         if (Object.keys(resultItem).length > 0) {
            result.push(resultItem);
         }
      }
      return result as T[];
   };

   const putItem = async <T>(query: PutItemQuery<T>): Promise<void> => {
      const { key, item } = query;
      const putItem = createDdbItem({ key: key, item: item || {} });
      const command = new PutCommand({ TableName: ddbTable, Item: putItem });
      await docClient.send(command);
   };

   const deleteItem = async (query: DeleteItemQuery): Promise<void> => {
      const { itemKey: key } = query;
      const command = new DeleteCommand({
         TableName: ddbTable,
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
