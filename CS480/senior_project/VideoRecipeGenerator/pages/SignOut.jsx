import useSignOut from 'react-auth-kit/hooks/useSignOut';

export default function SignOut() {
    async function signalCloseDB() {
        //signout is entirely handled here on the front end with react-auth-kit, this fetch tells my backend to close the DB connection
        //Need to write the backend signout function
        await fetch("http://localhost:5000/api/signout", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        }).then(async (data) => {
            if (data.ok) {
                const signOut = useSignOut();
                signOut();
                window.location.href = "/SignIn";

            } else {
                alert("failed to log out, please try again");
            }
        })
    }
    signalCloseDB();
    return null;
}
