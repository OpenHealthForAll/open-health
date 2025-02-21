import LoginScreen from '@/components/auth/login-screen';
import {Suspense} from "react";

export default function LoginPage() {
    return (
        <Suspense>
            <LoginScreen/>
        </Suspense>
    )
}
