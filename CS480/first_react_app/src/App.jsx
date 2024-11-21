import { NewTodoForm } from "./newTodoForm";
import "./styles.css"
import { useEffect, useState } from "react"
import { TodoList } from "./TodoList";
//created based off of Web Dev Simplified's tutorial "Learn React With This One Project": https://www.youtube.com/watch?v=Rh3tobg7hEo&t=108s
export default function App() {

  const [todos, setToDos] = useState(() => {
    const localValue = localStorage.getItem("ITEMS");
    if (localValue == null) return [];
    return JSON.parse(localValue);
  })

  useEffect(() => {
    localStorage.setItem("ITEMS", JSON.stringify(todos));
  }, [todos])
  function addTodo(title) {
    setToDos(currentTodos => {
      return [
        ...currentTodos,//spread("...") operator takes the current array and appends the following java script block to to it
        { id: crypto.randomUUID(), title, completed: false },
      ]
    })
  }
  function toggleToDo(id, completed) {
    setToDos(currentTodos => {
      return currentTodos.map(todo => {
        if (todo.id == id) {
          return { ...todo, completed };//in normal js you'd say todo.completed = completed, in react
          //the state is immutable which means it cannot be changed, you must return a new state 
          //object to trigger the re-render

        }
        return todo;
      })
    })
  }

  function deleteTodo(id) {
    setToDos(currentTodos => {
      return currentTodos.filter(todo => todo.id !== id)
    })
  }
  /*
  Notes on the following jsx:
    1. the key = {todo.id} is what allows react to unique id each <li> in the array
    2. components such as NewTodoForm must start with a capital letter*/
  return (
    <>
      <NewTodoForm onSubmit={addTodo} />
      <h1 className="header">Todo List</h1>
      <TodoList todos={todos} toggleTodo={toggleToDo} deleteTodo={deleteTodo} />
    </>
  )
}
