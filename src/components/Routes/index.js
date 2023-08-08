import { Route, Routes } from "react-router-dom"
import Home from "../../pages/Home";
import Category from "../../pages/Category";
import About from "../../pages/About";


export default function AppRoutes () {
    return (
       <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/:id" element={<Category />}/>
        <Route path="/about" element={<About />}/>
       </Routes>
    );
}