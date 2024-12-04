import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Recipe from '../pages/Recipe';
import ProgressBar from 'react-bootstrap/ProgressBar';

export default function Home() {
  let data = {};

  const [newURL, setNewURL] = useState("");
  const [recipe, setRecipe] = useState(null);
  const [progress, setProgress] = useState(0);
  async function handleSub(event) {
    setProgress(25);
    event.preventDefault();
    try {
      setProgress(45);
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newURL })
      }
      );
      setProgress(72);
      console.log("POST Sent for: ", newURL);
      setProgress(93);
      data = await response.json();
      setProgress(97);
      //setRecipe(data.recipe);
      console.log('here is data: ', data);
      setProgress(100);
      setRecipe(data);

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
        <ProgressBar striped animated now={progress} />
        <Recipe toRender={recipe} />
      </Form >


    </>
  )
}
