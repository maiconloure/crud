import { z as schema } from "zod";
import { todoRepository } from "@ui/repository/todo";
import { Todo } from "@ui/schema/todo";

interface TodoControllerParams {
  page: number;
}

async function get(params: TodoControllerParams) {
  return todoRepository.get({ page: params.page, limit: 1 });
}

function filterTodosByContent<Todo>(
  search: string,
  todos: Array<Todo & { content: string }>
): Todo[] {
  return todos.filter((todo) => {
    const searchNormalized = search.toLowerCase();
    const contentNormalized = todo.content.toLowerCase();
    return contentNormalized.includes(searchNormalized);
  });
}

interface TodoControllerCreateParams {
  content: string;
  onError: (customMessage?: string) => void;
  onSuccess: (todo: Todo) => void;
}

async function create({
  content,
  onSuccess,
  onError,
}: TodoControllerCreateParams) {
  const parsedParams = schema.string().min(1).safeParse(content);
  if (!parsedParams.success) {
    onError("Você PRECISA passar um conteúdo!");
    return;
  }

  const todo = await todoRepository.createByContent(parsedParams.data);

  onSuccess(todo);
}

export const todoController = {
  get,
  filterTodosByContent,
  create,
};
