import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Products from "../pages/Products";


export default function PageContent() {
    return (
      <div className='pageContent'>
       <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/store" element={<Products />}/>
       </Routes>
      </div>
    )
  }