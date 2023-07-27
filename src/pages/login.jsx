import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import logo from "./../assets/logo.png";
import "./../styles/login.css";

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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let timer;
    if (errorMessage) {
      timer = setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [errorMessage]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Login bem-sucedido:', user);

      // Verificar se o usuário é um administrador
      const db = getFirestore(app);
      const usersCollectionRef = collection(db, 'users');
      const usersQuery = query(usersCollectionRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(usersQuery);

      if (!querySnapshot.empty) {
        // O usuário foi encontrado na coleção "users"
        // Agora, verifique o papel do usuário
        const userData = querySnapshot.docs[0].data();
        const isAdmin = userData.role === 'admin';

        // Redirecionar para a página desejada após o login
        if (isAdmin) {
          window.location.href = '/ticket';
        } else {
          window.location.href = '/usuario';
        }
      } else {
        // O usuário não foi encontrado na coleção "users"
        // Redirecionar para a página /usuario (como padrão)
        window.location.href = '/usuario';
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error.message);
      setErrorMessage('Senha incorreta');
    }
  };

  return (
    <main>
      <div className="login-container">
        <div className="login-form">
          <div className="containerlogo">
            <img src={logo} alt="Logo" className="logologin" />
          </div>
          <div className="nomelogin">
            <h2 className="h2">Login</h2>
          </div>

          <form onSubmit={handleLogin}>
            <label>
              Email:
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <br />
            <label>
              Senha:
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            {errorMessage && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v8h-2zm0 10h2v2h-2z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}
            <br />
            <button type="submit">Entrar</button>
          </form>
          <div className="container-esqueceu">
            <p>Esqueceu a senha? </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
