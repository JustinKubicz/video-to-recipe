import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
/*
TODO:
  Need To make a get to the server for all recipe JSONS, then render out Recipe components based on that result
*/
export default function MyRecipes() {
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();
  const nav = useNavigate();

  if (!isAuthenticated) {
    return (
      <>
        <p>Please Sign-In First </p>
      </>
    );
  } else {
    return (
      <p>My Recipes is coming soon my brotha</p>
    )
  }


}
