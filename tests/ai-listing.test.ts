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

test("text drafting switches models on quota and model availability errors", async (t) => {
  const env = process.env;
  t.mock.property(process, "env", {
    ...env,
    GEMINI_TEXT_MODEL: "models/gemini-flash-latest",
  });
  const calls: string[] = [];
  const signals = new Set<AbortSignal | null | undefined>();
  const result = await polishListing(input, async (url, request) => {
    calls.push(String(url).split("/").at(-1)!.split(":")[0]);
    signals.add(request?.signal);
    return calls.length === 3
      ? textReply(draft)
      : new Response(null, { status: calls.length === 1 ? 429 : 404 });
  });
  assert.equal(result.title, draft.title);
  assert.deepEqual(calls, [
    "gemini-flash-latest",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
  ]);
  assert.equal(signals.size, 1);
});

test("header generation switches only to image models on quota and server errors", async (t) => {
  t.mock.property(process, "env", { ...process.env, GEMINI_IMAGE_MODEL: "" });
  const calls: string[] = [];
  const jpeg = Buffer.from([255, 216, 255, 224, 1, 2]);
  const image = await generateHeaderImage(
    draft.imageBrief,
    async (url, request) => {
      assert.match(String(url), /\/v1beta\/interactions$/);
      const body = JSON.parse(String(request?.body));
      calls.push(body.model);
      assert.equal(body.store, false);
      assert.equal(body.response_format.type, "image");
      if (calls.length < 3)
        return new Response(null, { status: calls.length === 1 ? 503 : 429 });
      return Response.json({
        output_image: { type: "image", data: jpeg.toString("base64") },
      });
    },
  );
  assert.deepEqual(image.bytes, jpeg);
  assert.deepEqual(calls, [
    "gemini-nano-banana-2.1",
    "gemini-3.1-flash-lite-image",
    "gemini-3.1-flash-image",
  ]);
});

test("a configured primary is tried once and quota exhaustion never relays provider bodies", async (t) => {
  t.mock.property(process, "env", {
    ...process.env,
    GEMINI_TEXT_MODEL: "gemini-3.5-flash-lite",
  });
  const calls: string[] = [];
  await assert.rejects(
    polishListing(input, async (url) => {
      calls.push(String(url).split("/").at(-1)!.split(":")[0]);
      return new Response("provider body with a credential", {
        status: calls.length === 1 ? 429 : 404,
      });
    }),
    (error: Error & { status?: number }) =>
      error.status === 429 &&
      /no fallback model/.test(error.message) &&
      !error.message.includes("credential"),
  );
  assert.deepEqual(calls, [
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ]);
});

test("Gemini authentication errors stop the chain", async () => {
  let calls = 0;
  await assert.rejects(
    polishListing(input, async () => {
      calls += 1;
      return new Response(null, { status: 401 });
    }),
    /API key and billing/,
  );
  assert.equal(calls, 1);
});
