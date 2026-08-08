import { useState } from "react"
import './Auth.css'

interface AuthModalProps {
    closeAuth: () => void;
}
function Auth({ closeAuth }: AuthModalProps) {
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')

    const handleCheck = () => {
        console.log(import.meta.env.VITE_LOGIN, import.meta.env.VITE_PASSWORD)
        if (login == import.meta.env.VITE_LOGIN && password == import.meta.env.VITE_PASSWORD) {
            localStorage.setItem('auth', 'false')
            closeAuth()
        }
        else { alert("Неверный логин или пароль") }
    }

    return (<>
        <div className="bg">
            <div className="form">

                <div className="sidebar__logo-text" style={{
                    color: '#222'
                }}>
                    ALMADENT
                    <span className="sidebar__logo-dot">.</span>
                    <h1>Авторизация</h1>

                </div>

                <div>
                    <input type="text" placeholder="Логин" onChange={(e) => setLogin(e.target.value)} />
                    <input type="Password" placeholder="Пароль" onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button className="btn" onClick={handleCheck}>Войти</button>
            </div>
        </div>
    </>)
}

export default Auth