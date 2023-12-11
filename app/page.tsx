"use client";
import React, { useEffect, useRef, useState } from "react";
import { GlobalStyles } from "@ui/theme/GlobalStyles";
import { todoController } from "@ui/controller/todo";

const bg = "/bg.jpeg";

interface Todo {
  id: string;
  content: string;
  done: boolean;
}

function HomePage() {
  const initialLoadComplete = useRef(false);
  const [newTodoContent, setNewTodoContent] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const homeTodos = todoController.filterTodosByContent<Todo>(search, todos);

  const hasMorePages = totalPages > page;
  const hasNoTodos = homeTodos.length === 0;

  useEffect(() => {
    if (!initialLoadComplete.current) {
      todoController
        .get({ page })
        .then(({ todos, pages }) => {
          setTodos(todos);
          setTotalPages(pages);
        })
        .finally(() => {
          setIsLoading(false);
          initialLoadComplete.current = true;
        });
    }
  }, []);

  return (
    <main>
      <GlobalStyles themeName="indigo" />
      <header
        style={{
          backgroundImage: `url('${bg}')`,
        }}
      >
        <div className="typewriter">
          <h1>What do today?</h1>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            todoController.create({
              content: newTodoContent,
              onSuccess(todo: Todo) {
                setTodos((oldTodos) => {
                  return [todo, ...oldTodos];
                });
                setNewTodoContent("");
              },
              onError(customMessage?: string) {
                alert(customMessage || " You need a content to create a ToDo");
              },
            });
          }}
        >
          <input
            name="add-todo"
            type="text"
            placeholder="Run, Study..."
            value={newTodoContent}
            onChange={function newTodoHandler(event) {
              setNewTodoContent(event.target.value);
            }}
          />
          <button type="submit" aria-label="Add new item">
            +
          </button>
        </form>
      </header>

      <section>
        <form>
          <input
            type="text"
            placeholder="Filter current list, ex: Workout"
            onChange={function handleSearch(event) {
              setSearch(event.target.value);
            }}
          />
        </form>

        <table border={1}>
          <thead>
            <tr>
              <th align="left">
                <input type="checkbox" disabled />
              </th>
              <th align="left">ID</th>
              <th align="left">Content</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {homeTodos.map((currentTodo) => {
              return (
                <tr key={currentTodo.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={currentTodo.done}
                      onChange={function handleToggle() {
                        todoController.toggleDone({
                          id: currentTodo.id,
                          onError(customMessage?: string) {
                            alert(customMessage || "Failed to update ToDo");
                          },
                          updateTodoOnScreen() {
                            setTodos((currentTodos) => {
                              return currentTodos.map((todo) => {
                                if (todo.id === currentTodo.id) {
                                  return {
                                    ...currentTodo,
                                    done: !currentTodo.done,
                                  };
                                }
                                return todo;
                              });
                            });
                          },
                        });
                      }}
                    />
                  </td>
                  <td>{currentTodo.id.substring(0, 4)}</td>
                  <td>
                    {!currentTodo.done && currentTodo.content}
                    {currentTodo.done && <s>{currentTodo.content}</s>}
                  </td>
                  <td align="right">
                    <button
                      data-type="delete"
                      onClick={function handleClick() {
                        todoController
                          .deleteById(currentTodo.id)
                          .then(() => {
                            setTodos((currentTodos) => {
                              return currentTodos.filter((todo) => {
                                return todo.id !== currentTodo.id;
                              });
                            });
                          })
                          .catch(() => {
                            alert("Failed to delete ToDo");
                          });
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}

            {isLoading && (
              <tr>
                <td colSpan={4} align="center" style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            )}

            {hasNoTodos && (
              <tr>
                <td colSpan={4} align="center">
                  No items found
                </td>
              </tr>
            )}

            {hasMorePages && (
              <tr>
                <td colSpan={4} align="center" style={{ textAlign: "center" }}>
                  <button
                    data-type="load-more"
                    onClick={() => {
                      setIsLoading(true);
                      const nextPage = page + 1;
                      setPage(nextPage);

                      todoController
                        .get({ page: nextPage })
                        .then(({ todos, pages }) => {
                          setTodos((oldTodos) => {
                            return [...oldTodos, ...todos];
                          });
                          setTotalPages(pages);
                        })
                        .finally(() => {
                          setIsLoading(false);
                        });
                    }}
                  >
                    Page: {page}, Load more{" "}
                    <span
                      style={{
                        display: "inline-block",
                        marginLeft: "4px",
                        fontSize: "1.2em",
                      }}
                    >
                      ↓
                    </span>
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default HomePage;
