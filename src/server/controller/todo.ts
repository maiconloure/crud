import { NextApiRequest, NextApiResponse } from "next";
import { z as schema } from "zod";
import { todoRepository } from "@server/repository/todo";
import { HttpNotFoundError } from "@server/infra/errors";

async function get(request: NextApiRequest, response: NextApiResponse) {
  const query = request.query;
  const page = Number(query.page);
  const limit = Number(query.limit);

  if (query.page && isNaN(page)) {
    response.status(400).json({
      error: {
        message: "`page` must be a number",
      },
    });
  }

  if (query.limit && isNaN(limit)) {
    response.status(400).json({
      error: {
        message: "`limit` must be a number",
      },
    });
  }

  try {
    const output = await todoRepository.get({ page, limit });

    response.status(200).json({
      pages: output.pages,
      total: output.total,
      todos: output.todos,
    });
  } catch (error) {
    response.status(500).json({
      error: {
        message: "Internal Server Error",
      },
    });
  }
}

const TodoCreateBodySchema = schema.object({
  content: schema.string(),
});
async function create(request: NextApiRequest, response: NextApiResponse) {
  // Fail Fast Validations
  const body = TodoCreateBodySchema.safeParse(request.body);
  // Type Narrowing
  if (!body.success) {
    response.status(400).json({
      error: {
        message: "You need to provide a content to create a ToDo",
        description: body.error.issues,
      },
    });
    return;
  }

  try {
    const createdTodo = await todoRepository.createByContent(body.data.content);

    response.status(201).json({
      todo: createdTodo,
    });
  } catch (error) {
    response.status(400).json({
      error: {
        message: "Failed to create ToDo",
      },
    });
  }
}

async function toggleDone(request: NextApiRequest, response: NextApiResponse) {
  const todoId = request.query.id;

  if (!todoId || typeof todoId !== "string") {
    response.status(400).json({
      error: {
        message: "You must provide an id",
      },
    });
    return;
  }

  try {
    const updatedTodo = await todoRepository.toggleDone(todoId);
    response.status(200).json({
      todo: updatedTodo,
    });
  } catch (error) {
    if (error instanceof Error) {
      response.status(404).json({
        error: {
          message: error.message,
        },
      });
    }
  }
}

async function deleteById(request: NextApiRequest, response: NextApiResponse) {
  const QuerySchema = schema.object({
    id: schema.string().uuid().min(1),
  });

  const parsedQuery = QuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    response.status(400).json({
      error: {
        message: `You must to provide a valid uuid`,
      },
    });
    return;
  }

  try {
    const todoId = parsedQuery.data.id;

    await todoRepository.deleteById(todoId);

    response.status(204).end();
  } catch (error) {
    if (error instanceof HttpNotFoundError) {
      response.status(error.status).json({
        error: {
          message: error.message,
        },
      });
      return;
    }
    response.status(500).json({
      error: {
        message: `Failed to delete resource`,
      },
    });
  }
}

export const todoController = {
  get,
  create,
  toggleDone,
  deleteById,
};
