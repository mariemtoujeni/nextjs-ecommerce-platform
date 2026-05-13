import { describe, expect, it } from "vitest";
import { uploadImageUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";

describe("uploadImageUseCase", () => {

  it("should upload an image and return a valid public URL", async () => {
    await signInTestUser(TestUser.ADMIN);

    const sampleImageBlob = new Blob(["test image content"], { type: "image/png" });
    const publicUrl = await uploadImageUseCase(sampleImageBlob);
    expect(typeof publicUrl).toBe("string");
    expect(publicUrl.startsWith("http")).toBe(false);
    expect(publicUrl).toMatch(/^\/evenements\/.+/);

  });
});
