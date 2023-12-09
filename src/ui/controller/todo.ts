import { todoRepository } from "@ui/repository/todo";

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
  onError: () => void;
  onSuccess: (todo: any) => void;
}

function create({ content, onSuccess, onError }: TodoControllerCreateParams) {
  if (!content) {
    onError();
    return;
  }

  const todo = {
    id: "1234",
    content,
    date: new Date(),
    done: false,
  };

  onSuccess(todo);
}

export const todoController = {
  get,
  filterTodosByContent,
  create,
};
