import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import React, { useState } from 'react';

const firebaseConfig = {
  // Suas configurações do Firebase
  apiKey: "AIzaSyBgMCFIZ_LNbSyRLr7QShKqJRtiVogjt7o",
  authDomain: "chamado-alpha.firebaseapp.com",
  projectId: "chamado-alpha",
  storageBucket: "chamado-alpha.appspot.com",
  messagingSenderId: "972707844687",
  appId: "1:972707844687:web:35275a5473d3faef2c103a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleAdminChange = (e) => {
    setIsAdmin(e.target.checked);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      // Cadastrar o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Adicionar o usuário ao Firestore com os dados fornecidos, incluindo o campo "role"
      await addDoc(collection(db, 'users'), {
        id: user.uid,
        email: user.email,
        role: isAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      });

      console.log('Usuário cadastrado com sucesso:', user);
      // Você pode redirecionar o usuário para outra página após o cadastro bem-sucedido

      // Limpar os campos do formulário
      setEmail('');
      setPassword('');
      setIsAdmin(false);
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      // Trate o erro de cadastro de usuário
    }
  };

  return (
    <div>
      <h2>Cadastro de Usuário</h2>
      <form onSubmit={handleSignUp}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
          />
        </div>
        <div>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <div>
          <label htmlFor="isAdmin">É administrador?</label>
          <input
            type="checkbox"
            id="isAdmin"
            checked={isAdmin}
            onChange={handleAdminChange}
          />
        </div>
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default SignUp;
