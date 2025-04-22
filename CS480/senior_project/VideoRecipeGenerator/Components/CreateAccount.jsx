import { Form, Button, ToggleButton } from "react-bootstrap";
import { useEffect, useState } from 'react';

import { Link } from "react-router-dom";
export default function Create() {

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [accountCreated, updateAccountCreate] = useState(false);
    const [passwordMessage, setPassMessage] = useState("Please Enter Password");
    const [passRequirementsMet, passRequirementsAreMet] = useState(false);
    const [passIsVisible, setPassVisibility] = useState(false);
    const [emailMessage, setEmailMessage] = useState("Please Enter a Valid Email Address");
    let requirements =
        [
            {
                requirement: `At least one capital letter.`,
                character: '⊗'
            },
            {
                requirement: `At least one number and one special character.`,
                character: '⊗'
            },
            {
                requirement: 'At least 8 characters long.',
                character: '⊗'
            },
        ];

    const onSubmit = (event) => {
        event.preventDefault();
        fetch('http://localhost:5000/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        }).then(async (res) => {
            if (res.ok) {
                console.log("user created: ", res);
                updateAccountCreate(true);

            } else if (res.status == 409) {
                setEmailMessage("An Account Already Exists With That Email")
            } else {
                let message = await res.text();
                throw new Error(res.status + ": " + message);
            }
        }).catch((error) => {
            console.error(error.message);
        })
    }
    useEffect(
        () => {
            if (formData.password) {

                if (/[A-Z]/.test(formData.password)) {
                    requirements[0].character = '✔';

                } else {
                    requirements[0].character = '⊗';

                }
                if (/[0-9]/.test(formData.password) && /[^a-zA-z0-9]/.test(formData.password)) {
                    requirements[1].character = '✔';

                } else {
                    requirements[1].character = '⊗';

                }
                if (formData.password.length >= 8) {
                    requirements[2].character = '✔';

                } else {
                    requirements[2].character = '⊗';

                }
                let met = 0;
                let ans = "Password Requirements\n";
                for (let i = 0; i < requirements.length; i++) {
                    ans += (requirements[i].character + ' ' + requirements[i].requirement + ' ');
                    if (i != 2) ans += '| ';
                    if (requirements[i].character == '✔') {
                        met++;
                    } else if (met > 0) {
                        met--;
                    }
                }
                if (met == 3) {
                    passRequirementsAreMet(true);
                } else {
                    passRequirementsAreMet(false);
                }
                setPassMessage(ans);

            } else {
                for (let i = 0; i < requirements.length; i++) {
                    requirements[i].character == '⊗';
                }
                passRequirementsAreMet(false);
            }
        }, [formData.password]
    )

    return (
        <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3" controlId="Main">
                <Form.Label>Please Provide A Valid Email:</Form.Label>
                <Form.Control placeholder="Email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} ></Form.Control>
                <Form.Text className="text-muted">
                    {emailMessage}
                </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="Main">
                <Form.Label>Choose a Unique Password:</Form.Label>
                {passIsVisible ?
                    <Form.Control placeholder="password" value={formData.password} onChange={(event) => {
                        if (event.target.value) {
                            setFormData({ ...formData, password: event.target.value });
                        }
                        else {
                            setFormData({ ...formData, password: "" });
                            setPassMessage("Please Enter Password");
                        }
                    }} /> :
                    <Form.Control placeholder="password" type="Password" value={formData.password} onChange={(event) => {
                        if (event.target.value) {
                            setFormData({ ...formData, password: event.target.value });
                        }
                        else {
                            setFormData({ ...formData, password: "" });
                            setPassMessage("Please Enter Password");
                        }
                    }} />}
                <Form.Text className="text-muted">
                    {passwordMessage}
                </Form.Text>

            </Form.Group>

            {accountCreated ?
                <Link to="/SignIn">Account Created, Please Sign In, Click Here</Link> :
                (passRequirementsMet ?
                    <div>
                        <Button variant="primary" type="submit">
                            Sign-Up
                        </Button> <ToggleButton
                            id="showPass"
                            type="checkbox"
                            variant="outline-secondary"
                            value="1"
                            checked={passIsVisible}
                            onChange={(event) => {
                                setPassVisibility(!passIsVisible);
                            }}>Show Password</ToggleButton>
                    </div> :
                    <div>
                        <Button variant="primary" type="submit" disabled>
                            Sign-Up
                        </Button> <ToggleButton
                            id="showPass"
                            type="checkbox"
                            variant="outline-secondary"
                            value={1}
                            checked={passIsVisible}
                            onChange={(event) => {
                                setPassVisibility(!passIsVisible);
                            }}>Show Password</ToggleButton>
                    </div>)}
        </Form >
    )
}