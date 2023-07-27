import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Cadastro from './pages/cadastro';
import Home from './pages/home';
import Login from './pages/login';
import User from './pages/usuario';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/ticket" element={<Home />} />
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/usuario" element={<User />} />
       
      </Routes>
    </BrowserRouter>
  );
};

export default App;
