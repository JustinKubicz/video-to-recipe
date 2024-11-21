export function TodoItem({ completed, id, title, toggleToDo, deleteTodo }) {
    return (
        <li>
            <label>
                <input type="checkbox" checked={completed}
                    onChange={event => {

                        toggleToDo(id, event.target.checked);
                    }}
                ></input>
                {title}
            </label>
            <button
                onClick={() => deleteTodo(id)}
                className="btn btn-danger">Delete</button>
        </li >
    )
}