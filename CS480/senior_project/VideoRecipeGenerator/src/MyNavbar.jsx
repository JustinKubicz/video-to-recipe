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
    const auth = useAuthUser();
    const [navName, updateNav] = useState("Welcome!");
    const [path, setPath] = useState("/SignIn");
    const [msg, setMessage] = useState("Sign-In To Save Recipes");
    useEffect(() => {
        if (isAuthenticated) {
            updateNav("Hello! " + auth.name);
            setPath("/SignOut");
            setMessage("Sign-out 😔");

        } else {
            updateNav("Welcome!");
            setPath("/SignIn");
            setMessage("Sign-In To Save Recipes");

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
                            <NavDropdown.Item as={Link} to="/MyRecipes"> My Recipes</NavDropdown.Item>
                        </NavDropdown>

                    </Nav>
                </Navbar.Collapse>
            </Container >
        </Navbar >
    )
}

