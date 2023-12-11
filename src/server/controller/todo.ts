import { z as schema } from "zod";
import { todoRepository } from "@server/repository/todo";
import { HttpNotFoundError } from "@server/infra/errors";

async function get(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = {
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
  };
  const page = Number(query.page);
  const limit = Number(query.limit);

  if (query.page && isNaN(page)) {
    return new Response(
      JSON.stringify({
        error: {
          message: "`page` must be a number",
        },
      }),
      {
        status: 400,
      }
    );
  }

  if (query.limit && isNaN(limit)) {
    return new Response(
      JSON.stringify({
        error: {
          message: "`limit` must be a number",
        },
      }),
      { status: 400 }
    );
  }

  try {
    const output = await todoRepository.get({ page, limit });

    return new Response(
      JSON.stringify({
        pages: output.pages,
        total: output.total,
        todos: output.todos,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          message: "Failed to get TODOs",
        },
      }),
      {
        status: 400,
      }
    );
  }
}

const TodoCreateBodySchema = schema.object({
  content: schema.string(),
});
async function create(request: Request) {
  // Fail Fast Validations
  const body = TodoCreateBodySchema.safeParse(await request.json());
  // Type Narrowing
  if (!body.success) {
    return new Response(
      JSON.stringify({
        error: {
          message: "You need to provide a content to create a ToDo",
          description: body.error.issues,
        },
      }),
      {
        status: 400,
      }
    );
  }

  try {
    const createdTodo = await todoRepository.createByContent(body.data.content);

    return new Response(
      JSON.stringify({
        todo: createdTodo,
      }),
      {
        status: 201,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          message: "Failed to create ToDo",
        },
      }),
      {
        status: 400,
      }
    );
  }
}

async function toggleDone(request: Request, id: string) {
  const todoId = id;

  if (!todoId || typeof todoId !== "string") {
    return new Response(
      JSON.stringify({
        error: {
          message: "You must provide an id",
        },
      }),
      {
        status: 400,
      }
    );
  }

  try {
    const updatedTodo = await todoRepository.toggleDone(todoId);
    return new Response(
      JSON.stringify({
        todo: updatedTodo,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          error: {
            message: error.message,
          },
        }),
        {
          status: 404,
        }
      );
    }
  }
}

async function deleteById(request: Request, id: string) {
  const query = {
    id,
  };
  const QuerySchema = schema.object({
    id: schema.string().uuid().min(1),
  });

  const parsedQuery = QuerySchema.safeParse(query);
  if (!parsedQuery.success) {
    return new Response(
      JSON.stringify({
        error: {
          message: `You must to provide a valid uuid`,
        },
      }),
      {
        status: 400,
      }
    );
  }

  try {
    const todoId = parsedQuery.data.id;

    await todoRepository.deleteById(todoId);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    if (error instanceof HttpNotFoundError) {
      return new Response(
        JSON.stringify({
          error: {
            message: error.message,
          },
        }),
        {
          status: error.status,
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: {
          message: `Failed to delete resource`,
        },
      }),
      {
        status: 500,
      }
    );
  }
}

export const todoController = {
  get,
  create,
  toggleDone,
  deleteById,
};
