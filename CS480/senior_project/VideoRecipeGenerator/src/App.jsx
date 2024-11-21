import { useState, useEffect } from 'react'
import "./styles.css"


function App() {

  //const [backendData, setBackendData] = useState([{}]);

  // useEffect(() => {
  //   fetch("http://localhost:5000/api").then(
  //     response => {
  //       if (!response.ok) {
  //         throw new Error(`Network response was not ok: ${response.statusText}`);
  //       } else {

  //         console.log("response received.");
  //         return response.json();
  //       }
  //     }
  //   ).then(
  //     data => {
  //       setBackendData(data);
  //       console.log("backend data set. ");
  //     }
  //   ).catch(error => {
  //     console.log("im in the error block.")
  //     console.error('Fetch error: ', error);
  //     setBackendData({ error: 'Failed to fetch data' });
  //   })
  // }, []);
  const [newURL, setNewURL] = useState("");
  const [recipe, setRecipe] = useState("");
  async function handleSub(event) {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newURL })
      }

      );
      console.log("POST Sent for: ", newURL);
      const data = await response.json();
      //setRecipe(data.recipe);
      console.log('here is data: ', data);
    } catch (error) {
      console.error('Error processing video:', error);
    }
  };
  return (
    <>
      <form onSubmit={handleSub} className="new-item-form">
        <div className="form-row">
          <label htmlFor="link">Enter a valid youtube URL: </label>
          <input value={newURL} onChange={event => setNewURL(event.target.value)} type="text" id="link"></input>
        </div>
        <button className="btn">Generate</button>
      </form>
    </>
  )
}

export default App
