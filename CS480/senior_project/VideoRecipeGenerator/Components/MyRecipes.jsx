import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Recipe from '../pages/Recipe';
import CloseButton from 'react-bootstrap/CloseButton'
export default function MyRecipes() {
  try {
    const [selected, updateSelection] = useState(false);
    const [selectedRecipe, setRecipe] = useState({});
    const [userHasNoRecipesSaved, userHasNone] = useState(false);
    const [DESTROY, itemDeleted] = useState(false);
    const user = useAuthUser();
    const nav = useNavigate();
    const [response, setResponse] = useState([]);
    useEffect(() => {
      async function grabRecipes() {

        let ans = await fetch(`http://localhost:5000/api/buildMyRecipes?email=${user.name}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(async (res) => {
          if (res.ok) {
            res = await res.json();
            console.log(res);
            if (Array.isArray(res))
              setResponse(res);
            else {
              userHasNone(true);
            }
          } else {
            console.error("error, MyRecipes.jsx: ", res.status);
          }
        });
        return ans;

      }
      grabRecipes();
    }, [user.name])

    async function del(anItem, anIndex) {
      //delete function
      // 1. make delete fetch()
      console.log(`Deleting ${anItem.videoId} from account: ${user.name}`)
      await fetch(`http://localhost:5000/api/delete?email=${user.name}&id=${anItem.videoId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
        //2.in the then block starting where that recipe was in the array, shift everything on the right, left into that position
        //    unless there is only one item in the array, in which case we need to just update userHasNoRecipesSaved to true. 
        .then(
          async (res) => {
            if (res.ok) {
              if (response.length == 1) userHasNone(true); //if after deletion, there was only 1, just set userHasNone to true and the card will go away
              else setResponse(response.splice(anIndex)); //else splice the cards and they'll rerender
            } else {
              console.error("error del function in MyRecipes: ", res.status);
            }
          }
        )
    }

    if (!userHasNoRecipesSaved) {

      if (!selected) {

        return (
          <div>
            {
              response.map((item, index) => {
                return (
                  <div key={index}>
                    <Card style={{ width: '18rem' }}>
                      <Card.Body>
                        <Card.Title>{item.name}</Card.Title>
                        <Button variant="primary" onClick={() => {
                          updateSelection(true);
                          setRecipe(item);
                        }}>View</Button>
                        <Button variant="secondary" onClick={async () => {
                          await del(item, index);
                          itemDeleted(!DESTROY);//should just trigger a rerender of the cards after a deletion
                        }}>Delete</Button>
                      </Card.Body>
                    </Card>
                  </div>
                )
              })
            }
          </div>
        )
      }
      else {
        return (
          <div id="main">
            <Recipe toRender={selectedRecipe} isAlreadySaved={true}>
            </Recipe>
            <CloseButton id="close" onClick={() => updateSelection(false)}></CloseButton>
            <style>{`
            #main{
              position: relative;
            }
            #close{
              position: absolute;
              top: 10px;
              left: -75px;
            }
            `}
            </style>
          </div>
        )
      }
    } else {
      return (<p>Try saving some recipes after you generate them!</p>)
    }
  } catch (err) {
    console.error("MyRecipes Error: ", err);
  }


}
