import { Todo } from "@ui/schema/todo";

interface TodoRepositoryGetParams {
  page: number;
  limit: number;
}
interface TodoRepositoryGetOutput {
  todos: Todo[];
  total: number;
  pages: number;
}

function get({
  page,
  limit,
}: TodoRepositoryGetParams): Promise<TodoRepositoryGetOutput> {
  return fetch(`api/todos?page=${page}&limit=${limit}`).then(
    async (response) => {
      const todosString = await response.text();
      const responseParsed = parseTodosFromServer(JSON.parse(todosString));

      return {
        todos: responseParsed.todos,
        total: responseParsed.total,
        pages: responseParsed.pages,
      };
    }
  );
}

export const todoRepository = {
  get,
};

// Model/Schema
// interface Todo {
//   id: string;
//   content: string;
//   date: Date;
//   done: boolean;
// }

function parseTodosFromServer(responseBody: unknown): {
  total: number;
  pages: number;
  todos: Array<Todo>;
} {
  if (
    responseBody !== null &&
    typeof responseBody === "object" &&
    "total" in responseBody &&
    "pages" in responseBody &&
    "todos" in responseBody &&
    Array.isArray(responseBody.todos)
  ) {
    return {
      total: Number(responseBody.total),
      pages: Number(responseBody.pages),
      todos: responseBody.todos.map((todo: unknown) => {
        if (todo === null && typeof todo !== "object") {
          throw new Error("Invalid todo from API");
        }

        const { id, content, date, done } = todo as {
          id: string;
          content: string;
          date: string;
          done: string;
        };

        return {
          id,
          content,
          date: date,
          done: String(done).toLowerCase() === "true",
        };
      }),
    };
  }

  return {
    total: 0,
    pages: 0,
    todos: [],
  };
}
