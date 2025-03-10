import { useState } from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Recipe from './Recipe';
import ProgressBar from 'react-bootstrap/ProgressBar';
export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [newURL, setNewURL] = useState("");
  const [recipe, setRecipe] = useState(null);
  const [progress, setProgress] = useState(0);
  const [recipeId, setRecipeId] = useState("");
  let mainFormLabel = "Your Next Masterpiece: ";
  let mainFormPlaceHolder = "Paste Youtube or TikTok URL Here...";
  let mainFormText = "Works with valid Youtube and TikTok URLs";
  let submitButtonText = "Create Recipe 🍽";
  async function sleep() {
    return new Promise(resolve => {
      setTimeout(resolve, 100);
    })
  }
  async function animateProgressBar(start, end) {
    for (let i = start; i <= end; i++) {

      setProgress(i);
      await sleep();
    }
  }

  async function handleSub(event) {
    setIsLoading(true);
    animateProgressBar(0, 75);
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newURL })
      }
      );
      await animateProgressBar(75, 85);
      console.log("home.jsx: POST Sent for: ", newURL);
      let data = await response.json();
      //setRecipe(data.recipe);
      console.log('home.jsx: here is data: ', data);
      console.log('home.jsx:', data.data);
      console.log('home.jsx:', data.id);
      setRecipeId(data.id);
      await animateProgressBar(85, 100);
      setIsLoading(false);
      setRecipe(data.data);
    } catch (error) {
      console.error('Error processing video:', error);
    }
  };

  return (
    <>
      <Form onSubmit={handleSub}>
        <Form.Group className="mb-3" controlId="Main">
          <Form.Label>{mainFormLabel}</Form.Label>
          <Form.Control placeholder={mainFormPlaceHolder} value={newURL} onChange={event => setNewURL(event.target.value)} ></Form.Control>
          <Form.Text className="text-muted">
            {mainFormText}
          </Form.Text>
        </Form.Group>
        <Button variant="primary" type="submit">
          {submitButtonText}
        </Button><br />

      </Form >
      {isLoading ? <ProgressBar striped animated now={progress} /> :
        <Recipe toRender={recipe} recipeId={recipeId} isAlreadySaved={false} />}

    </>
  )
}
