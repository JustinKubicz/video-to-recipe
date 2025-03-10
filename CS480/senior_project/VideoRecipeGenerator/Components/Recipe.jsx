import './Recipe.css';
import { Button } from 'react-bootstrap';
import { useState } from 'react';
import Image from 'react-bootstrap/Image';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import EditRecipe from './EditRecipe';
export default function Recipe(props) {
    const { recipeId, toRender, isAlreadySaved } = props;
    console.log("currentRecipeID: ", recipeId);
    console.log("current recipe: ", toRender);
    const [isSaved, updateSaved] = useState(isAlreadySaved);
    const [id, updateRecipeId] = useState(recipeId);
    const isAuthenticated = useIsAuthenticated();
    const user = useAuthUser();
    const [editMode, toggleEditMode] = useState(false);

    function handlePrinting() {
        window.print();
    }
    async function SaveToMyRecipes() {
        console.log(id);
        const response = await fetch('http://localhost:5000/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "id": id,
                "email": user.name
            })
        }
        );
        console.log(response);
        updateSaved(true);
    }
    if (toRender) {
        if (editMode) {
            return (<EditRecipe recipeId={recipeId} recipe={toRender} isAlreadySaved={isSaved} updateEditMode={toggleEditMode} updateId={updateRecipeId} />)
        } else {
            return (

                <body>

                    <h2 class="printable">{toRender.name}</h2>
                    <Button variant='secondary' type='button' onClick={handlePrinting}>Print This</Button>

                    <Button variant='secondary' type='button' onClick={() => toggleEditMode(true)}>Edit Recipe</Button>

                    {isAuthenticated ?
                        (isSaved || isAlreadySaved ? <p>Saved to My Recipes</p> : <Button variant='secondary' type='button' onClick={SaveToMyRecipes}>Save To My Recipes</Button>)
                        : null}
                    <div class="printable">
                        <h3>Ingredients:</h3>

                        <ul>
                            {toRender.ingredients.map((ingredient, index) => {
                                return (<li key={index} >{ingredient.ingredient} : {ingredient.amount}</li>)
                            })}
                        </ul>
                        <h3>Instructions: </h3>
                        <ul>
                            {
                                toRender.instructions.map((instruction, index) => {
                                    return (<li key={index}>{instruction.instruction}</li>)
                                })
                            }
                        </ul>
                    </div>
                </body>
            )
        }
    } else {
        return (

            <Image src="../assets/Secondary.png" roundedCircle />

        )
    }



}