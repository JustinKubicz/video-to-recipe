import { Form, Button } from "react-bootstrap";
import axios from 'axios'
import { useState } from 'react';
import { resolveComponent } from "vue";
import { Link } from "react-router-dom";
export default function Create() {

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [accountCreated, updateAccountCreate] = useState(false);


    const onSubmit = (event) => {
        event.preventDefault();
        axios.post('http://localhost:5000/api/users', formData).then((res) => {
            if (res) {
                console.log("user created: ", res);
                updateAccountCreate(true);

            } else {
                console.error(res.status);
            }
        })
    }

    return (
        <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3" controlId="Main">
                <Form.Label>Please Provide A Valid Email:</Form.Label>
                <Form.Control placeholder="Email" value={formData.email} onChange={event => setFormData({ ...formData, email: event.target.value })} ></Form.Control>
                <Form.Text className="text-muted">
                    Please Enter Email.
                </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="Main">
                <Form.Label>Choose a Unique Password:</Form.Label>
                <Form.Control placeholder="Password" value={formData.password} onChange={event => { setFormData({ ...formData, password: event.target.value }) }} />
                <Form.Text className="text-muted">
                    Please Enter Password.
                </Form.Text>
            </Form.Group>
            {accountCreated ? <Link to="/SignIn">Account Created, Please Sign In, Click Here</Link> : <Button variant="primary" type="submit">
                Sign-Up
            </Button>}
        </Form >
    )
}