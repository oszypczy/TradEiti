import { describe, expect, it } from "vitest";
import { axiosBase } from "./axiosConfig";
import { removeJwtToken, saveToken } from "../auth/JwtToken";

// Run the request through the interceptors without hitting the network.
async function sentHeaders() {
  const response = await axiosBase.get("/anything", {
    adapter: async (config) => ({
      data: null,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }),
  });
  return response.config.headers;
}

describe("axiosBase", () => {
  it("uses the relative /api base URL by default", () => {
    expect(axiosBase.defaults.baseURL).toBe("/api");
  });

  it("reads the current token on every request", async () => {
    expect((await sentHeaders()).Authorization).toBeUndefined();
    saveToken("first");
    expect((await sentHeaders()).Authorization).toBe("Bearer first");
    saveToken("second");
    expect((await sentHeaders()).Authorization).toBe("Bearer second");
    removeJwtToken();
    expect((await sentHeaders()).Authorization).toBeUndefined();
  });
});
