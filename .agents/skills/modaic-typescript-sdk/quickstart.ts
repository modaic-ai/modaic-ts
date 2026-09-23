// Direct inference. Run with MODAIC_API_KEY and bun; makes a billable API call.
import { Choice, Modaic, Noul, Score } from "modaic";

export async function classify(client: Modaic) {
  return client.decisions.create({
    model: "typesafe/jev-latest",
    state: { description: "Waterproof hiking boots, size 42" },
    questions: {
      outdoor: new Noul({ instructions: "Is this product intended for outdoor use?" }),
      department: new Choice({ criteria: {
        apparel: "Clothes and footwear", electronics: "Electronic devices", other: "Other products",
      } }),
      specificity: new Score({ criteria: [
        "No identifiable product", "Product category only", "Specific product with useful details",
      ] }),
    },
  });
}

if (import.meta.main) {
  const result = await classify(new Modaic());
  const answer = result.answers.department;
  if (answer?.type === "choice") console.log(answer.choice);
}
