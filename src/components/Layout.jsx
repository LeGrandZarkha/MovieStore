import { Link, Outlet } from "react-router"

export default function Layout() {
    return (
        <>
            <nav className="flex gap-10 justify-center pt-5">
                <Link to="/">Découvertes</Link>
                <Link to="/favorites">Favoris</Link>
                <button onClick={() => { }}>Connexion</button>
            </nav>
            <Outlet />
        </>
    )
}