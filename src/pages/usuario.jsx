import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FaList, FaPen, FaSignOutAlt } from 'react-icons/fa';
import logo from "./../assets/logo.png";
import "./../styles/estilo.css";

// Configuração do Firebase
const firebaseConfig = {
  // Coloque suas próprias chaves de API e configurações do projeto aqui
  apiKey: "AIzaSyBgMCFIZ_LNbSyRLr7QShKqJRtiVogjt7o",
  authDomain: "chamado-alpha.firebaseapp.com",
  projectId: "chamado-alpha",
  storageBucket: "chamado-alpha.appspot.com",
  messagingSenderId: "972707844687",
  appId: "1:972707844687:web:35275a5473d3faef2c103a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Login bem-sucedido
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      // Tratar o erro de login
    }
  };

  return (
    <main className="mainlogin2">
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <div className="lg-contain">
              <img src={logo} alt="Logo" className="logoerro" />
            </div>
            <div className="containernome">
              <h2 className="nome">Login</h2>
            </div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className="form-input"
            />
          </div>
          <button type="submit" className="login-button">Entrar</button>
          <div className="container-esqueceu">
            <p>Esqueceu a senha? </p>
          </div>
        </form>
      </div>
    </main>
  );
};

const TicketSystem = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [tickets, setTickets] = useState([]);
  const [userChamados, setUserChamados] = useState([]); // Novo estado para os chamados do usuário
  const [activePage, setActivePage] = useState('Fazer Chamado');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState(''); // Estado para armazenar o nome do usuário
  
 

 useEffect(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      setLoggedIn(true);
      console.log("Usuário logado:", user.email);
      setUserName(user.displayName || ''); // Define o nome do usuário no estado userName
      setName(user.displayName || ''); // Preenche o campo "Nome" no formulário
      // ... (outro código)
    } else {
      setLoggedIn(false);
      setUserName(''); // Limpa o nome do usuário quando ele fizer logout
      setUserChamados([]);
      setName(''); // Limpa o campo "Nome" no formulário quando o usuário fizer logout
    }
  });

  return () => {
    unsubscribeAuth();
  };
}, [auth, db]);

  useEffect(() => {
    const unsubscribeTickets = onSnapshot(collection(db, 'chamados'), (snapshot) => {
      const updatedTickets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(updatedTickets);
    });

    return () => {
      unsubscribeTickets();
    };
  }, [db]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
        // Buscar os chamados do usuário logado
        console.log("Usuário logado:", user.email);
        setUserName(user.displayName || ''); // Define o nome do usuário no estado userName
        onSnapshot(collection(db, 'chamados'), (snapshot) => {
          const userChamados = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((chamado) => chamado.email === user.email); // Filtrar os chamados do usuário logado
          console.log("Chamados do usuário:", userChamados);
          setUserChamados(userChamados);
        });
      } else {
        setLoggedIn(false);
        setUserName(''); // Limpa o nome do usuário quando ele fizer logout
        setUserChamados([]);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [auth, db]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };
  

  const handleDepartmentChange = (e) => {
    setDepartment(e.target.value);
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();

    const newTicket = {
      title: title,
      description: description,
      name: name,
      department: department,
      status: 'Pendente',
      date: new Date().toISOString(),
      email: auth.currentUser.email // Adicionando o e-mail do usuário logado ao chamado
    };

    try {
      // Salvar o novo chamado no banco de dados Firestore
      const docRef = await addDoc(collection(db, 'chamados'), newTicket);
      console.log('Chamado adicionado com ID:', docRef.id);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Erro ao adicionar chamado:', error);
    }

    setTitle('');
    setDescription('');
    setName('');
    setDepartment('');
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    setSelectedTicket(null);
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleCompleteTicket = async () => {
    // ... (código existente)
  };

  const handleDeleteTicket = async () => {
    // ... (código existente)
  };

  const handleCloseTicket = () => {
    setSelectedTicket(null);
  };

  if (!loggedIn) {
    return <Login />;
  }
  

  const isAdmin = false; // Defina o nível de acesso do usuário (true para admin, false para usuário comum)

  return (
    <div className="ticket-system">
      <div className="sidebar">
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>
        <div className="container-bem">
            <p className="bem">Bem vindo ! {userName}!</p>
          </div>
        <div className="user-name">{userName}</div> {/* Exibe o nome do usuário */}
        {!isAdmin && (
          <div>
            <button
              className={activePage === 'Fazer Chamado' ? 'active' : ''}
              onClick={() => handlePageChange('Fazer Chamado')}
            >
             <FaPen style={{ marginRight: '8px' }} /> Fazer Chamado
            </button>
            <button
              className={activePage === 'Meus Chamados' ? 'active' : ''}
              onClick={() => handlePageChange('Meus Chamados')}
            >
               <FaList style={{ marginRight: '8px' }} />Meus Chamados
            </button>
          </div>
        )}
        <button onClick={() => signOut(auth)}><FaSignOutAlt style={{ marginRight: '8px' }} />Sair</button>
      </div>
      <div className="content">
        {activePage === 'Fazer Chamado' && (
          <div>
            <h2>Fazer Chamado</h2>
            <form onSubmit={handleTicketSubmit}>
              <label>
                Título:
                <input type="text" value={title} onChange={handleTitleChange} />
              </label>
              <br />
              <label>
                Descrição:
                <textarea
                  value={description}
                  onChange={handleDescriptionChange}
                  style={{ height: '150px' }}
                 
                />
              </label>
              <br />
              <label>
                Nome:
                <input type="text" value={name} onChange={handleNameChange} />
              </label>
              <br />
              <label>
                Setor:
                <input
                  type="text"
                  value={department}
                  onChange={handleDepartmentChange}
                 
                />
              </label>
              
              <br />
              <button type="submit">Criar Chamado</button>
            </form>
          </div>
        )}

        {activePage === 'Meus Chamados' && (
          <div>
          <h2>Meus Chamados</h2>
          {/* Adicione as classes para a tabela */}
          <table className="custom-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {userChamados.map((chamado) => (
                <tr key={chamado.id}>
                  <td>{chamado.title}</td>
                  <td>{chamado.status}</td>
                  <td>{chamado.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
{showSuccessMessage && (
          <div className="success-message">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Chamado realizado com sucesso
          </div>
        )}

        {selectedTicket && (
          <div className="view-ticket">
            {/* Detalhes do chamado selecionado (código existente) */}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketSystem;
