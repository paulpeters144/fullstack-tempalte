import { describe, expect, it } from "vitest";
import { createDdbItem } from "../util";

describe("createDynamoDBItem", () => {
   it("should properly transform complex nested object with all supported types", () => {
      const complexItem = {
         userId: "user123",
         age: 25,
         isActive: true,
         createdAt: new Date("2023-12-25T10:30:00.000Z"),
         metadata: {
            preferences: {
               theme: "dark",
               notifications: true,
            },
            scores: [95, 87, 92],
         },
         tags: ["premium", "verified"],
         nestedArray: [
            { id: 1, name: "item1" },
            { id: 2, name: "item2" },
         ],
      };

      const result = createDdbItem({
         key: { pk: "USER#123", sk: "PROFILE" },
         item: complexItem,
      });

      expect(result).toEqual({
         PK: "USER#123",
         SK: "PROFILE",
         userId: "user123",
         age: 25,
         isActive: true,
         createdAt: "2023-12-25T10:30:00.000Z",
         metadata: {
            preferences: {
               theme: "dark",
               notifications: true,
            },
            scores: [95, 87, 92],
         },
         tags: ["premium", "verified"],
         nestedArray: [
            { id: 1, name: "item1" },
            { id: 2, name: "item2" },
         ],
      });

      expect(result.PK).toBe("USER#123");
      expect(result.SK).toBe("PROFILE");

      expect(result.createdAt).toBe("2023-12-25T10:30:00.000Z");
      expect(typeof result.createdAt).toBe("string");

      // @ts-ignore
      expect(result.metadata.preferences.theme).toBe("dark");
      // @ts-ignore
      expect(result.metadata.scores).toEqual([95, 87, 92]);

      expect(Array.isArray(result.tags)).toBe(true);
      expect(result.nestedArray).toHaveLength(2);
      // @ts-ignore
      expect(result.nestedArray[0].id).toBe(1);
   });

   it("should work with only keys", () => {
      const result = createDdbItem({
         key: {
            pk: "USER#123",
            sk: "PROFILE",
         },
      });

      expect(result.PK).toBe("USER#123");
      expect(result.SK).toBe("PROFILE");
   });
});
