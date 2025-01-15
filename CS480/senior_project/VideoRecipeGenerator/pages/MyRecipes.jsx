import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
/*
TODO:
  Need To make a get to the server for all recipe JSONS, then render out Recipe components based on that result
*/
export default async function MyRecipes() {
  const user = useAuthUser();
  const nav = useNavigate();
  const response = await fetch('http://localhost:5000/api/get', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      "email": user.name
    })
  }).then((res) => {
    if (res.ok) {
      console.log(response);
    } else {
      console.error("error, MyRecipes.jsx: ", response.status);
    }
  });
  let recipes = response.payLoad;



  return (
    <p>My Recipes is coming soon my brotha</p>
  )



}
