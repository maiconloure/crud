export async function GET() {
  return new Response(JSON.stringify({ message: "Index Message" }), {
    status: 200,
  });
}
