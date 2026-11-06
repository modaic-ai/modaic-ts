// Direct inference. Run with MODAIC_API_KEY and bun; makes a billable API call.
import { Choice, Datetime, Modaic, Noul, Number, Score, Text } from "modaic";

export async function classify(client: Modaic) {
  return client.decisions.create({
    model: "mo-latest",
    state: { description: "Waterproof hiking boots, size 42" },
    questions: {
      outdoor: new Noul({ instructions: "Is this product intended for outdoor use?" }),
      department: new Choice({ criteria: {
        apparel: "Clothes and footwear", electronics: "Electronic devices", other: "Other products",
      } }),
      specificity: new Score({ criteria: [
        "No identifiable product", "Product category only", "Specific product with useful details",
      ] }),
      itemCount: new Number({ instructions: "How many items are listed?" }),
      listedOn: new Datetime({
        instructions: "When was this product listed?",
        criteria: { format: "YYYY-MM-DD" },
      }),
      summary: new Text({ instructions: "Summarize the listing in five words." }),
    },
  });
}

if (import.meta.main) {
  const result = await classify(new Modaic());
  const answer = result.answers.department;
  if (answer?.type === "choice") console.log(answer.choice);
}
