const baseUrl = process.env.CLEARBANK_API_URL ?? "http://localhost:4000";

async function main() {
  const response = await fetch(`${baseUrl}/demo/seed`, { method: "POST" });
  if (!response.ok) {
    throw new Error(`Seeding failed with status ${response.status}.`);
  }
  const payload = (await response.json()) as { message: string };
  console.log(payload.message);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
