
import { Button } from 'react-bootstrap';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Image from 'react-bootstrap/Image';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
export default function Recipe(props) {
    const { recipeId, toRender, isAlreadySaved } = props;
    const [isSaved, updateSaved] = useState(false);
    const isAuthenticated = useIsAuthenticated();
    const user = useAuthUser();
    function handlePrinting() {
        window.print();
    }
    async function SaveToMyRecipes() {
        const response = await fetch('http://localhost:5000/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "id": recipeId,
                "email": user.name
            })
        }
        );
        console.log(response);
        updateSaved(true);
    }
    if (toRender) {

        return (

            <>

                <h2>{toRender.name}</h2>
                <Button variant='secondary' type='button' onClick={handlePrinting}>Print This</Button>
                {isAuthenticated ?
                    (isSaved || isAlreadySaved ? <p>Saved to My Recipes</p> : <Button variant='secondary' type='button' onClick={SaveToMyRecipes}>Save To My Recipes</Button>)
                    : null}
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
                            return (<li key={index}>{instruction}</li>)
                        })
                    }
                </ul>

            </>
        )
    }
    return (

        <Image src="../assets/Secondary.png" roundedCircle />

    )



}