import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Recipe from '../Components/Recipe';
import ProgressBar from 'react-bootstrap/ProgressBar';

export default function Home() {
  const [formSubmitted, triggerProgressBar] = useState(false);
  const [newURL, setNewURL] = useState("");
  const [recipe, setRecipe] = useState(null);
  const [progress, setProgress] = useState(0);
  const [recipeId, setRecipeId] = useState("");

  async function sleep() {
    return new Promise(resolve => {
      setTimeout(resolve, 150);
    })
  }
  async function animateProgressBar(start, end) {
    for (let i = start; i <= end; i++) {

      setProgress(i);
      await sleep();
    }
  }

  async function handleSub(event) {
    triggerProgressBar(true);
    animateProgressBar(0, 100);
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newURL })
      }
      );
      console.log("POST Sent for: ", newURL);
      let data = await response.json();
      //setRecipe(data.recipe);
      console.log('here is data: ', data);
      console.log(data.data);
      console.log(data.id);
      setRecipeId(data.id);
      setProgress(100);
      triggerProgressBar(false);
      setRecipe(data.data);
    } catch (error) {
      console.error('Error processing video:', error);
    }
  };

  return (
    <>
      <Form onSubmit={handleSub}>
        <Form.Group className="mb-3" controlId="Main">
          <Form.Label>Your Next Masterpiece:</Form.Label>
          <Form.Control placeholder="Paste YouTube URL here." value={newURL} onChange={event => setNewURL(event.target.value)} ></Form.Control>
          <Form.Text className="text-muted">
            Only works with valid YouTube or YouTube Shorts URLs, TikTok support coming soon...
          </Form.Text>
        </Form.Group>
        <Button variant="primary" type="submit">
          Create Recipe 🍽
        </Button><br />
        {formSubmitted && <ProgressBar striped animated now={progress} />}
        <Recipe toRender={recipe} recipeId={recipeId} />
      </Form >


    </>
  )
}
