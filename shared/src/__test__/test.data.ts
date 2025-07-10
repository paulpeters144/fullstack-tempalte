import { z } from "zod";

const schema = z.object({
   id: z.string().uuid(),
   username: z.string().max(3),
   email: z.string().email(),
   age: z.number().int().positive().max(3),
   address: z.object({
      street: z.string().max(3),
      city: z.string().max(3),
      state: z.string().length(3),
      zipCode: z.string().length(5),
   }),
   interests: z.array(z.string().max(3)),
   isAdmin: z.boolean(),
   settings: z.object({
      darkMode: z.boolean(),
      notifications: z.boolean(),
      themeColors: z.object({
         primary: z.string().max(3),
         secondary: z.string().max(3),
         tertiary: z.object({
            option1: z.string().max(3),
            option2: z.number(),
            option3: z.object({
               nestedOption1: z.string().max(3),
               nestedOption2: z.string().max(3),
            }),
         }),
      }),
      friends: z.array(
         z.object({
            id: z.string().uuid(),
            name: z.string().max(3),
            age: z.number().int().positive(),
         }),
      ),
   }),
});

export type UserProfileType = z.infer<typeof schema>;

const failingProfile = {
   id: "awordthatsaword",
   username: "awordthatsaword",
   email: "awordthatsaword",
   age: -1,
   address: {
      street: "awordthatsaword",
      city: "awordthatsaword",
      state: "awordthatsaword",
      zipCode: "awordthatsaword",
   },
   interests: ["awordthatsaword", "awordthatsaword"],
   isAdmin: "awordthatsaword",
   settings: {
      darkMode: "awordthatsaword",
      notifications: "awordthatsaword",
      themeColors: {
         primary: "awordthatsaword",
         secondary: "awordthatsaword",
         tertiary: {
            option1: "awordthatsaword",
            option2: "awordthatsaword",
            option3: {
               nestedOption1: "awordthatsaword",
               nestedOption2: "awordthatsaword",
            },
         },
      },
      friends: [
         {
            id: "awordthatsaword",
            name: "awordthatsaword",
            age: -1,
         },
      ],
   },
};

const passingProfile = {
   id: "1efb13b3-61f6-4ee7-86c1-71f7f7c69707",
   username: "abc",
   email: "abc@example.com",
   age: 3,
   address: {
      street: "abc",
      city: "abc",
      state: "abc",
      zipCode: "10001",
   },
   interests: ["abc", "abc"],
   isAdmin: false,
   settings: {
      darkMode: true,
      notifications: true,
      themeColors: {
         primary: "abc",
         secondary: "abc",
         tertiary: {
            option1: "abc",
            option2: 42,
            option3: {
               nestedOption1: "abc",
               nestedOption2: "abc",
            },
         },
      },
      friends: [
         {
            id: "1efb13b3-61f6-4ee7-86c1-71f7f7c69707",
            name: "abc",
            age: 3,
         },
         {
            id: "1efb13b3-61f6-4ee7-86c1-71f7f7c69707",
            name: "abc",
            age: 3,
         },
      ],
   },
};

export const TestData = () => {
   return { schema, failingProfile, passingProfile };
};
