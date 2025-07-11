type DynamoDBPrimitive = string | number | boolean | Date;

type DynamoDBValue =
   | DynamoDBPrimitive
   | DynamoDBValue[]
   | { [key: string]: DynamoDBValue };

type DynamoDBInput = Record<string, DynamoDBValue>;

type SerializedDynamoDBPrimitive = string | number | boolean;

type SerializedDynamoDBValue =
   | SerializedDynamoDBPrimitive
   | SerializedDynamoDBValue[]
   | { [key: string]: SerializedDynamoDBValue };

type DynamoDBItem = {
   PK: string;
   SK: string;
} & Record<string, SerializedDynamoDBValue>;

class CreateDdbItemErr extends Error {}

export const createDdbItem = <T extends DynamoDBInput>(props: {
   key: { pk: string; sk: string };
   item?: T;
}): DynamoDBItem => {
   const isPrimitiveType = (value: DynamoDBValue): value is DynamoDBPrimitive => {
      return (
         typeof value === "string" ||
         typeof value === "number" ||
         typeof value === "boolean" ||
         value instanceof Date
      );
   };

   const addValueToItem = (
      value: DynamoDBValue,
      depth = 0,
   ): SerializedDynamoDBValue => {
      if (depth >= 10) {
         throw new CreateDdbItemErr("Recursion depth exceeded 10 levels");
      }

      if (isPrimitiveType(value)) {
         if (value instanceof Date) {
            return value.toISOString();
         }
         return value;
      }
      if (Array.isArray(value)) {
         return value.map((v) => addValueToItem(v, depth + 1));
      }
      if (typeof value === "object" && value !== null) {
         return addObjectToItem(value, depth + 1);
      }
      throw new Error(`unknown type:\n${JSON.stringify(value)}`);
   };

   const addObjectToItem = (
      obj: Record<string, DynamoDBValue>,
      depth: number,
   ): Record<string, SerializedDynamoDBValue> => {
      const processedObject: Record<string, SerializedDynamoDBValue> = {};

      for (const [key, value] of Object.entries(obj)) {
         processedObject[key] = addValueToItem(value, depth);
      }

      return processedObject;
   };

   const { item, key } = props;
   const dynamoDBItem: DynamoDBItem = {
      PK: key.pk,
      SK: key.sk,
   };

   if (!item) {
      return dynamoDBItem;
   }

   for (const [key, value] of Object.entries(item)) {
      dynamoDBItem[key] = addValueToItem(value);
   }

   return dynamoDBItem;
};

// type DynamoDBPrimitive = string | number | boolean | Date;

// type DynamoDBValue =
//    | DynamoDBPrimitive
//    | DynamoDBValue[]
//    | { [key: string]: DynamoDBValue };

// type DynamoDBInput = Record<string, DynamoDBValue>;

// type DynamoDBItem<T> =
//    | ({
//         PK: string;
//         SK: string;
//      } & T)
//    | {
//         PK: string;
//         SK: string;
//      };

// export const createDdbItem = <T extends DynamoDBInput>(props: {
//    key: { pk: string; sk: string };
//    item?: T | undefined;
// }): DynamoDBItem<T> => {
//    const { item, key } = props;

//    if (!item) {
//       return {
//          PK: key.pk,
//          SK: key.sk,
//       };
//    }

//    return {
//       PK: key.pk,
//       SK: key.sk,
//       ...item,
//    };
// };
