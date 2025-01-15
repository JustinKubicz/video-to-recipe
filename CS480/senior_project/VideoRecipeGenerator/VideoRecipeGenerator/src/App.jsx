import "./styles.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavbar from "../src/MyNavbar";
import SignIn from '../pages/SignIn';
import MyRecipes from '../pages/MyRecipes';
import Home from '../pages/Home';
import { Route, Routes } from "react-router-dom";
import RequireAuth from "react-auth-kit";
import Create from "../pages/CreateAccount.jsx";
import SignOut from '../pages/SignOut.jsx';

function App() {
  return (
    <>
      <MyNavbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/MyRecipes" element={
            // <RequireAuth loginPath="/Sign-In" >//I can't figure out fucking RequireAuth, maybe some day
            <MyRecipes />
            // </RequireAuth>
          } />
          <Route path="/CreateAccount" element={
            <Create />
          } />
          <Route path="/SignOut" element={
            <SignOut />
          } />
        </Routes>
      </div>
    </>
  );
}

export default App;
