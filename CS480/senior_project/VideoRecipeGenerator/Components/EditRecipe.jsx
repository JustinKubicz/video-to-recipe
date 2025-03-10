import { useState } from 'react'
import { FormGroup, FormLabel } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
//https://www.freecodecamp.org/news/clone-an-object-in-javascript/
export default function EditRecipe(props) {

    const { recipeId, recipe, isAlreadySaved, updateEditMode, updateId } = props;
    const [workingRecipeIngredients, updateWorkingRecipeIngredients] = useState(recipe.ingredients);
    const [workingRecipeInstructions, updateWorkingRecipeInstructions] = useState(recipe.instructions);
    const [changesMade, changesWereMade] = useState(false);
    console.log("isAlreadySaved:", isAlreadySaved);
    const handleSubmit = (e) => {
        //Eventually, alert before saving that overwrite's are final and permanent
        console.log("handle sub called");
        e.preventDefault();
        //This needs to fetch() an api POST destination and provide new recipe JSON as well as recipeId
        recipe.ingredients = workingRecipeIngredients;
        recipe.instructions = workingRecipeInstructions;
        fetch("http://localhost:5000/api/update", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "recipe": recipe,
                "recipeId": recipeId,
                "isAlreadySaved": isAlreadySaved
            })
        }).then(
            async (res) => {
                if (res.ok) {
                    //Then, receive confirmation from backend, and redirect to MyRecipes if the recipe was already saved
                    //otherwise, redirect to home component with new recipe as default recipe
                    if (isAlreadySaved) {
                        updateEditMode(false);
                    } else {
                        let data = await res.json()
                        console.log(data.recipeId);
                        updateId(data.recipeId);
                        updateEditMode(false);
                    }
                } else {
                    throw new Error(res);
                }
            }
        ).catch(
            (error) => {
                console.error("EditRecipe.jsx: ", error);
            }
        )

    }


    return (
        <>
            <h1>Ingredients</h1>
            <Form onSubmit={handleSubmit}>
                {
                    recipe.ingredients.map((ingredient, index) => {
                        return (
                            <FormGroup key={index} className="mb-3">
                                <Form.Label>{ingredient.ingredient} : {ingredient.amount}</Form.Label>
                                <Form.Control
                                    value={workingRecipeIngredients[index].amount}
                                    onChange={(event) => {
                                        changesWereMade(true);
                                        //https://react.dev/reference/react/useState#updating-objects-and-arrays-in-state
                                        //create a shallow copy of the array of ingredient objects
                                        let copy = [...workingRecipeIngredients];
                                        //create a shallow copy of the individual ingredient
                                        let copyIngredient = { ...copy[index] };
                                        copyIngredient.amount = event.target.value;
                                        //in the copy array, update the index to point to the new object
                                        copy[index] = copyIngredient;
                                        //send in this new array as the workingIngredients
                                        updateWorkingRecipeIngredients(copy);
                                        //React may not detect modifying the workingRecipeIngredients directly if I were to just pass it in that way
                                        //due to Objects being passed by reference

                                    }}
                                />
                                {
                                    ingredient.amount == "BLANK" ?
                                        <Form.Text>Current Amount: No Amount Found</Form.Text> :
                                        <Form.Text>Current Amount: {ingredient.amount}</Form.Text>
                                }


                            </FormGroup>
                        )
                    })
                }
                <h1>Instructions</h1>
                {
                    recipe.instructions.map((instruction, index) => {
                        return (
                            <FormGroup key={index} className="mb-3">
                                <FormLabel>Step {index + 1}.</FormLabel>
                                <Form.Control
                                    as="textarea"

                                    value={workingRecipeInstructions[index].instruction}
                                    onChange={(event) => {
                                        changesWereMade(true);
                                        //Same logic as in the ingredients block
                                        let copy = [...workingRecipeInstructions];
                                        let copyInstruction = { ...copy[index] };
                                        copyInstruction.instruction = event.target.value;
                                        copy[index] = copyInstruction;
                                        updateWorkingRecipeInstructions(copy);
                                    }}
                                />
                            </FormGroup>
                        )
                    })
                }
                {changesMade ?
                    <Button variant="primary" type="submit">Save Changes</Button> :
                    <Button variant="primary" type="submit" disabled>Save Changes</Button>
                }
                <Button variant="secondary" onClick={() => {
                    updateEditMode(false);
                }
                }>Cancel</Button>
            </Form>
        </>
    )


}