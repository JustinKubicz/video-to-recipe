import useSignOut from 'react-auth-kit/hooks/useSignOut';

export default function SignOut() {



    const signOut = useSignOut();
    signOut();
    window.location.href = "/SignIn";


}
