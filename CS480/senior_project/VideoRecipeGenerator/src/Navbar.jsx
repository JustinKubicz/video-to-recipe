import { Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

export default function MyNavbar() {
    const path = window.location.pathname;
    return (
        <Navbar expand="lg" className="bg-body-tertiary" >
            <Container>
                <Navbar.Brand as={Link} to="/"><img src="..\assets\Primary.png" width="60" height="60" />VideoToRecipe</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <NavDropdown title="Welcome!" id="basic-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/Sign-In">Sign-In To Save Recipes</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/MyRecipes"> My Recipes</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

