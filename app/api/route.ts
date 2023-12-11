export async function GET(request: Request) {
  return new Response(JSON.stringify({ message: "Index Message" }), {
    status: 200,
  });
}
