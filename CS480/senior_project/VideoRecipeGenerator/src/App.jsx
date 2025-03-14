import "./styles.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavbar from "../src/MyNavbar";
import SignIn from '../Components/SignIn.jsx';
import MyRecipes from '../Components/MyRecipes';
import Home from '../Components/Home';
import { Route, Routes } from "react-router-dom";
import Create from "../Components/CreateAccount.jsx";
import SignOut from '../Components/SignOut.jsx';

function App() {
  return (
    <>
      <MyNavbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/MyRecipes" element={
            <MyRecipes />
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
