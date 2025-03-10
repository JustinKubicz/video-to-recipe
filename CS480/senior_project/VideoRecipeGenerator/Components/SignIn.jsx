
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { Link } from 'react-router-dom';
import { Form, Button, ToggleButton } from "react-bootstrap";
import { useState } from "react";



export default function SignIn() {
  const signIn = useSignIn();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [emailMessage, setEmailMessage] = useState("Please enter email");
  const [passMessage, setPassMessage] = useState("Please enter password.");
  const [passIsVisible, setPassVisibility] = useState(false);
  const onSubmit = async (e) => {
    //https://authkit.arkadip.dev/reference/react-auth-kit/hooks/useSignIn/#signinconfig-parameters
    e.preventDefault()
    fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(async (res) => {
      console.log(res.token);
      if (res.ok) {
        let data = await res.json();
        console.log(data);
        let authResponse = signIn({
          auth: {
            token: data.token,
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
          throw new Error("react-auth-kit error");
        }
      } else if (res.status == 404) {
        //user not found
        setEmailMessage("No account associated with that email, please create an account.")
      } else if (res.status == 500) {
        //wrong password
        setPassMessage("Incorrect Password");
      } else {
        let message = await res.text();
        throw new Error(res.status + ": " + message);

      }
    }).catch((error) => {
      console.error(error.message);
    })


  }
  return (
    <Form onSubmit={onSubmit}>
      <Form.Group className="mb-3" controlId="Main">
        <Form.Label>Login Email:</Form.Label>
        <Form.Control placeholder="Email" value={formData.email} onChange={event => setFormData({ ...formData, email: event.target.value })} ></Form.Control>
        <Form.Text className="text-muted">
          {emailMessage}
        </Form.Text>
      </Form.Group>
      <Form.Group className="mb-3" controlId="Main">
        <Form.Label>Password:</Form.Label>
        {passIsVisible ?
          <Form.Control
            placeholder="Password"
            value={formData.password}
            onChange={event => {
              setFormData({ ...formData, password: event.target.value })
            }
            }
          />
          :
          <Form.Control
            placeholder="Password"
            type="Password"
            value={formData.password}
            onChange={event => {
              setFormData({ ...formData, password: event.target.value })
            }
            }
          />
        }
        <Form.Text className="text-muted">
          {passMessage}
        </Form.Text>
      </Form.Group>
      <Button variant="primary" type="submit">
        Sign-In
      </Button>
      <ToggleButton
        id="showPass"
        type="checkbox"
        variant="outline-secondary"
        value="1"
        checked={passIsVisible}
        onChange={(event) => {
          setPassVisibility(!passIsVisible);
        }}>Show Password</ToggleButton>
      <br />
      <Button variant="secondary" as={Link} to="/CreateAccount">Create Account</Button>
    </Form >
  )
}

