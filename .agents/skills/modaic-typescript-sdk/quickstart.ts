// Requires MODAIC_API_KEY and bun; makes a billable API call.
import { Choice, Date, Span, Modaic, Noul } from "modaic";

export async function classify(client: Modaic) {
  return client.decisions.create({
    model: "mo-latest",
    state: "Waterproof hiking boots, size 42",
    questions: {
      outdoor: new Noul({ instructions: "Is this product intended for outdoor use?" }),
      department: new Choice({
        instructions: "Which department fits this product?",
        criteria: {
          apparel: "Clothes and footwear", electronics: "Electronic devices", other: "Other products",
        },
      }).nullable(),
      evidence: new Span({ instructions: "Extract the product name" }),
      published: new Date({ instructions: "Publication date?" }).nullable(0.8),
    },
  });
}

if (import.meta.main) {
  const result = await classify(new Modaic());
  if (result.answers.department !== null) {
    console.log(result.answers.department.choice); // "apparel" | "electronics" | "other"
  }
  console.log(result.answers.outdoor.noul, result.answers.evidence.span);
}
