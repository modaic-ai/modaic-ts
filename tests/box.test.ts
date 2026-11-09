import { expect, test } from "bun:test";
import { Box, Modaic, ModaicConnectionError } from "../src/index.js";

const coordinates = { top: 0.1, bottom: 0.8, left: 0.2, right: 0.9 };
function payload(box = coordinates) {
  return { model: "mo-2.0", answers: { region: { type: "box", box, confidence: 0.9 } }, usage: { input_tokens: 1, output_tokens: 1 } };
}

test("Box constructor infers coordinates and preserves the request shape", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async (_url, init) => {
    expect(JSON.parse(String(init?.body)).questions).toEqual({ region: { type: "box", instructions: "Find" } });
    return Response.json(payload());
  } });
  const result = await client.decisions.create({ model: "mo-2.0", state: {}, questions: { region: new Box({ instructions: "Find" }) } });
  expect(result.answers.region).toBeInstanceOf(Box);
  const top: number = result.answers.region.box.top;
  expect(top).toBe(0.1);
  expect(result.answers.region.instructions).toBe("Find");
  expect(result.answers.region.name).toBe("region");
});

test("saved-model Box responses reach custom response schemas", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async () => Response.json(payload()) });
  const result = await client.decisions.create({ model: "acme/image", state: {}, schema: { parse(value: unknown) { return value as { answers: { region: { box: { top: number } } } }; } } });
  expect(result.answers.region.box.top).toBe(0.1);
});

test("Box supports nullable composition", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async () => Response.json({ ...payload(), answers: {
    ...payload().answers, __modaic_answerable_region: { type: "noul", noul: 0.1 },
  } }) });
  const result = await client.decisions.create({ model: "mo-2.0", state: {}, questions: { region: new Box({ instructions: "Find" }).nullable() } });
  expect(result.answers.region).toBeNull();
});

for (const box of [{ ...coordinates, top: -0.1 }, { ...coordinates, right: 1.1 }, { ...coordinates, top: 0.9 }]) {
  test(`invalid Box is rejected ${JSON.stringify(box)}`, async () => {
    const client = new Modaic({ apiKey: "test", fetch: async () => Response.json(payload(box)) });
    await expect(client.decisions.create({ model: "acme/image", state: {} })).rejects.toBeInstanceOf(ModaicConnectionError);
  });
}


test("Box confidence may be null", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async () => Response.json({
    ...payload(), answers: { region: { ...payload().answers.region, confidence: null } },
  }) });
  const result = await client.decisions.create({ model: "mo-2.0", state: {}, questions: { region: new Box({ instructions: "Find" }) } });
  const confidence: number | null = result.answers.region.confidence;
  expect(confidence).toBeNull();
  expect(result.answers.region.box.top).toBe(0.1);
});
