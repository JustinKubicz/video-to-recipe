import axios from 'axios';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { Link } from 'react-router-dom';
import { Form, Button } from "react-bootstrap";
import { useState } from "react";



export default function SignIn() {
  const signIn = useSignIn()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const onSubmit = async (e) => {
    //https://authkit.arkadip.dev/reference/react-auth-kit/hooks/useSignIn/#signinconfig-parameters
    e.preventDefault()
    axios.post('http://localhost:5000/api/login', formData)
      .then((res) => {
        console.log(res.data);
        if (res.status === 200) {
          let authResponse = signIn({
            auth: {
              token: res.data.token,
              expiresIn: 3600,
              type: "Bearer",
            },
            userState: {
              name: formData.email,
              uid: `123456`
            }

          });
          if (authResponse) {
            console.log(authResponse);
            window.location.href = "/MyRecipes";
          } else {
            return < p > Incorrect Username / Password</p >
          }
        }
      })
  }
  return (
    <Form onSubmit={onSubmit}>
      <Form.Group className="mb-3" controlId="Main">
        <Form.Label>Login Email:</Form.Label>
        <Form.Control placeholder="Email" value={formData.email} onChange={event => setFormData({ ...formData, email: event.target.value })} ></Form.Control>
        <Form.Text className="text-muted">
          Please Enter Email.
        </Form.Text>
      </Form.Group>
      <Form.Group className="mb-3" controlId="Main">
        <Form.Label>Password:</Form.Label>
        <Form.Control placeholder="Password" value={formData.password} onChange={event => { setFormData({ ...formData, password: event.target.value }) }} />
        <Form.Text className="text-muted">
          Please Enter Password.
        </Form.Text>
      </Form.Group>
      <Button variant="primary" type="submit">
        Sign-In
      </Button><br />
      <Button variant="secondary" as={Link} to="/CreateAccount">Creat Account</Button>
    </Form >
  )
}

