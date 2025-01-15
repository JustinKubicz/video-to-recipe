import { Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { useEffect, useState } from "react";
export default function MyNavbar() {
    const isAuthenticated = useIsAuthenticated();
    //I didn't know this at decision time, but React-Auth-Kit has an issue with useIsAuthenticated hook, can be found here:: https://github.com/react-auth-kit/react-auth-kit/issues/1541
    //But basically, I'm forced to manually refresh the page upon sign in and sign out until the issue is fixed or I find a new Auth library.
    const auth = useAuthUser();
    const [navName, updateNav] = useState("Welcome!");
    const [path, setPath] = useState("/SignIn");
    const [path2, setPath2] = useState("/CreateAccount");
    const [msg, setMessage] = useState("Sign-In To Save Recipes");
    const [msg2, setMessage2] = useState("Create Account");
    useEffect(() => {
        if (isAuthenticated) {
            updateNav("Hello! " + auth.name);
            setPath("/SignOut");
            setMessage("Sign-out 😔");
            setPath2("/MyRecipes");
            setMessage2("MyRecipes");
        } else {
            updateNav("Welcome!");
            setPath("/SignIn");
            setMessage("Sign-In To Save Recipes");
            setPath2("/CreateAccount");
            setMessage2("Create Account");
        }
    }, [isAuthenticated, auth])



    return (
        <Navbar expand="lg" className="bg-body-tertiary" >
            <Container>
                <Navbar.Brand as={Link} to="/"><img src="..\assets\Primary.png" width="60" height="60" />VideoToRecipe</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <NavDropdown title={navName} id="basic-nav-dropdown">
                            <NavDropdown.Item as={Link} to={path}>{msg}</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to={path2}> {msg2}</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container >
        </Navbar >
    )
}

