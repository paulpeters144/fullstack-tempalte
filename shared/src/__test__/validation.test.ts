import { describe, expect, it } from "vitest";
import { TestData } from "~/src/__test__/test.data";
import { type LoginRequest, LoginSchema } from "~/src/types";
import { validate } from "~/src/validation";

describe("#Validation Zod Schemas", () => {
   it("invalidate username and password", () => {
      const schema = LoginSchema;
      const input: LoginRequest = { email: "email@email", password: "pass" };

      const { model, result } = validate(schema).on(input);

      expect(model?.email).toBeTruthy();
      expect(model?.password).toBeTruthy();
      expect(result.success).toBe(false);
   });

   it("invalidate incorrect usage of zValidate", () => {
      const schema = LoginSchema;

      // @ts-ignore: only using for testing a failing example
      const { model, result } = validate(schema).on({});

      expect(model).toBeTruthy();
      expect(result.success).toBe(false);
   });

   it("validate username and password", () => {
      const schema = LoginSchema;
      const input = { email: "email@email.com", password: "password" };

      const { model, result } = validate(schema).on(input);

      expect(model?.email).toBeFalsy();
      expect(model?.password).toBeFalsy();
      expect(result.success).toBe(true);
   });

   it("nested model validation that fails", () => {
      const { schema, failingProfile } = TestData();
      const { model, result } = validate(schema).on(failingProfile);
      expect(model?.id).toBeTruthy();
      expect(model?.username).toBeTruthy();
      expect(model?.email).toBeTruthy();
      expect(model?.age).toBeTruthy();
      expect(model?.address?.street).toBeTruthy();
      expect(model?.address?.city).toBeTruthy();
      expect(model?.address?.state).toBeTruthy();
      expect(model?.address?.zipCode).toBeTruthy();

      expect(model?.interests).toHaveLength(2);
      model?.interests?.map((i) => {
         expect(i).toBeTruthy();
      });

      expect(model?.isAdmin).toBeTruthy();
      expect(model?.settings?.darkMode).toBeTruthy();
      expect(model?.settings?.notifications).toBeTruthy();
      expect(model?.settings?.themeColors?.primary).toBeTruthy();
      expect(model?.settings?.themeColors?.secondary).toBeTruthy();
      expect(model?.settings?.themeColors?.tertiary?.option1).toBeTruthy();
      expect(model?.settings?.themeColors?.tertiary?.option2).toBeTruthy();
      expect(
         model?.settings?.themeColors?.tertiary?.option3?.nestedOption1,
      ).toBeTruthy();
      expect(
         model?.settings?.themeColors?.tertiary?.option3?.nestedOption2,
      ).toBeTruthy();

      expect(model?.settings?.friends).toHaveLength(1);
      model?.settings?.friends?.forEach((f) => {
         expect(f?.id).toBeTruthy();
         expect(f?.name).toBeTruthy();
         expect(f?.age).toBeTruthy();
      });

      expect(result.success).toBe(false);
   });

   it("nested model validation that passes", () => {
      const { schema, passingProfile } = TestData();
      const { model, result } = validate(schema).on(passingProfile);
      expect(model?.id).toBeFalsy();
      expect(model?.username).toBeFalsy();
      expect(model?.email).toBeFalsy();
      expect(model?.age).toBeFalsy();
      expect(model?.address?.street).toBeFalsy();
      expect(model?.address?.city).toBeFalsy();
      expect(model?.address?.state).toBeFalsy();
      expect(model?.address?.zipCode).toBeFalsy();
      expect(model?.interests).toBeFalsy();
      expect(model?.isAdmin).toBeFalsy();
      expect(model?.settings?.darkMode).toBeFalsy();
      expect(model?.settings?.notifications).toBeFalsy();
      expect(model?.settings?.themeColors?.primary).toBeFalsy();
      expect(model?.settings?.themeColors?.secondary).toBeFalsy();
      expect(model?.settings?.themeColors?.tertiary?.option1).toBeFalsy();
      expect(model?.settings?.themeColors?.tertiary?.option2).toBeFalsy();
      expect(
         model?.settings?.themeColors?.tertiary?.option3?.nestedOption1,
      ).toBeFalsy();
      expect(
         model?.settings?.themeColors?.tertiary?.option3?.nestedOption2,
      ).toBeFalsy();
      expect(model?.settings?.friends).toBeFalsy();
      expect(result.success).toBe(true);
   });
});
