import test from "node:test";
import assert from "node:assert/strict";
import {
  generateHeaderImage,
  listingInputSchema,
  polishListing,
} from "../lib/ai-listing";

const input = listingInputSchema.parse({
  title: "Image annotator",
  department: "AI data",
  location: "Philippines (Remote)",
  workSetting: "Project-Basis",
  remote: true,
  listing: "Compare image pairs and explain your pick.",
  qualifications: "Written English",
});

const draft = {
  title: "Image Annotator",
  department: "Different department",
  roleType: "Annotation",
  location: "Different location",
  summary: "Compare image pairs.",
  description: "## Tasks\n**Compare** images and explain your choice.",
  requirements: "1. Written English\n- Written English",
  warnings: ["Weekly hours were not provided."],
  imageBrief: "Two image frames side by side above a checklist.",
};

function textReply(value: unknown) {
  return Response.json({
    candidates: [{ content: { parts: [{ text: JSON.stringify(value) }] } }],
  });
}

const priorKey = process.env.GEMINI_API_KEY;
process.env.GEMINI_API_KEY = "test-gemini-key";
test.after(() => {
  if (priorKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = priorKey;
});

test("Gemini drafts validate output and preserve entered metadata", async () => {
  assert.equal(
    listingInputSchema.safeParse({ ...input, listing: "", qualifications: "" })
      .success,
    false,
  );
  const result = await polishListing(input, async (url, request) => {
    assert.match(
      String(url),
      /generativelanguage\.googleapis\.com\/v1beta\/models\/[^/]+:generateContent$/,
    );
    assert.equal(
      new Headers(request?.headers).get("x-goog-api-key"),
      "test-gemini-key",
    );
    const body = JSON.parse(String(request?.body));
    assert.equal(body.generationConfig.responseMimeType, "application/json");
    assert.deepEqual(JSON.parse(body.contents[0].parts[0].text), input);
    assert.doesNotMatch(String(request?.body), /test-gemini-key/);
    return textReply(draft);
  });
  assert.equal(result.department, input.department);
  assert.equal(result.location, input.location);
  assert.equal(
    result.description,
    "Tasks\nCompare images and explain your choice.",
  );
  assert.equal(result.requirements, "Written English");
});

test("Gemini errors reject malformed drafts and never relay provider bodies", async () => {
  await assert.rejects(
    polishListing(input, async () => textReply({})),
    /did not fit/,
  );
  await assert.rejects(
    polishListing(input, async () =>
      textReply({ ...draft, summary: "Pay is ₱300/hr." }),
    ),
    /included a pay figure/,
  );
  await assert.rejects(
    polishListing(
      input,
      async () =>
        new Response("provider body with a credential", { status: 429 }),
    ),
    { status: 429, message: "Gemini is rate limited. Try again later." },
  );
});

test("Gemini header generation requests a stateless 3:2 image and validates bytes", async () => {
  const jpeg = Buffer.from([255, 216, 255, 224, 1, 2]);
  const result = await generateHeaderImage(
    draft.imageBrief,
    async (url, request) => {
      assert.match(String(url), /v1beta\/interactions$/);
      assert.equal(
        new Headers(request?.headers).get("Api-Revision"),
        "2026-05-20",
      );
      const body = JSON.parse(String(request?.body));
      assert.equal(body.store, false);
      assert.equal(body.response_format.aspect_ratio, "3:2");
      assert.match(body.input, /Two image frames/);
      return Response.json({
        steps: [
          {
            type: "model_output",
            content: [{ type: "image", data: jpeg.toString("base64") }],
          },
        ],
      });
    },
  );
  assert.equal(result.ext, "jpg");
  assert.deepEqual(result.bytes, jpeg);
  await assert.rejects(
    generateHeaderImage(draft.imageBrief, async () =>
      Response.json({
        output_image: {
          type: "image",
          data: Buffer.from("<svg/>").toString("base64"),
        },
      }),
    ),
    /unsupported header image/,
  );
  await assert.rejects(
    generateHeaderImage(draft.imageBrief, async () =>
      Response.json({
        output_image: {
          type: "image",
          data: Buffer.alloc(2 * 1024 * 1024 + 1).toString("base64"),
        },
      }),
    ),
    /exceeded 2 MB/,
  );
});
