import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FaCheck, FaEye, FaList, FaPen, FaSignOutAlt, FaTrash, FaUserPlus } from 'react-icons/fa';
import SignUp from "../pages/cadastro";
import logo from './../assets/logo.png';
import './../styles/estilo.css';




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

const LoginPage = () => {
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
      console.error('Erro ao fazer login:', error.message);
      setErrorMessage('Senha incorreta');
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
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
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
  const [activePage, setActivePage] = useState('Fazer Chamado');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

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
      } else {
        setLoggedIn(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

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
      date: new Date().toISOString() // Salva a data atual em formato ISO (string)
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

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowTitle(true);
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleString(); // Converte a data para uma string no formato local
  };

  const handleCompleteTicket = async () => {
    if (selectedTicket) {
      const updatedTickets = tickets.map((ticket) => {
        if (ticket.id === selectedTicket.id) {
          const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000;
          const currentDate = new Date().getTime();
          const ticketDate = new Date(ticket.date).getTime(); // Converte a data do chamado para milissegundos
          const differenceInMilliseconds = currentDate - ticketDate;

          if (differenceInMilliseconds > twentyFourHoursInMilliseconds) {
            return {
              ...ticket,
              status: 'Atrasado'
            };
          } else {
            return {
              ...ticket,
              status: 'Concluído'
            };
          }
        }
        return ticket;
      });

      setTickets(updatedTickets);

      try {
        await updateDoc(doc(db, 'chamados', selectedTicket.id), {
          status: updatedTickets.find((ticket) => ticket.id === selectedTicket.id)?.status || selectedTicket.status
        });
        console.log('Estado do chamado atualizado no banco de dados:', selectedTicket);
      } catch (error) {
        console.error('Erro ao atualizar o estado do chamado:', error);
      }

      setSelectedTicket((prevState) => {
        const updatedTicket = updatedTickets.find((ticket) => ticket.id === prevState.id);
        if (updatedTicket) {
          return { ...prevState, status: updatedTicket.status };
        }
        return prevState;
      });
    }
  };

  const handleDeleteTicket = async () => {
    try {
      // Excluir o chamado do banco de dados Firestore
      await deleteDoc(doc(db, 'chamados', selectedTicket.id));
      console.log('Chamado excluído do banco de dados:', selectedTicket);
      setSelectedTicket(null);
    } catch (error) {
      console.error('Erro ao excluir o chamado:', error);
    }
  };
  

  const handleCloseTicket = () => {
    setSelectedTicket(null);
    setShowTitle(false);
  };

  if (!loggedIn) {
    return <LoginPage />;
  }

  const isAdmin = true; // Defina o nível de acesso do usuário (true para admin, false para usuário comum)

    return (
      <div className="ticket-system">
        <div className="sidebar">
          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>
          <div className="container-bem">
            <p className="bem">Bem vindo !</p>
          </div>
          {isAdmin && (
            <div>
              <button
                className={activePage === 'Fazer Chamado' ? 'active' : ''}
                onClick={() => setActivePage('Fazer Chamado')}
              >
              <FaPen style={{ marginRight: '8px' }} />Fazer Chamado 
              </button>
              <button
                className={activePage === 'Lista de Chamados' ? 'active' : ''}
                onClick={() => setActivePage('Lista de Chamados')}
              >
                  <FaList style={{ marginRight: '8px' }} />  Lista de Chamados {/* Ícone personalizado */}
              </button>
              <button
  className={activePage === 'Cadastrar Usuário' ? 'active' : ''}
  onClick={() => setActivePage('Cadastrar Usuário')}
>
  <FaUserPlus style={{ marginRight: '8px' }} /> Cadastrar Usuário {/* Ícone personalizado */}
</button>

            </div>
            
          )}
          
          <button onClick={() => signOut(auth)}>
          <FaSignOutAlt style={{ marginRight: '8px' }} /> Sair {/* Ícone personalizado */}
          </button>
        </div>
        <div className="content">
          {activePage === 'Fazer Chamado' && (
            <div>
              <h2>
                 Fazer Chamado 
              </h2>
              <form onSubmit={handleTicketSubmit}>
                <label>
                  Título:
                  <input type="text" value={title} onChange={handleTitleChange} placeholder='Titulo Breve'/>
                  
                </label>
                <br />
                <label>
                  Descrição:
                  <textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    style={{ height: '150px' }}
                    placeholder='Descrição Completa'
                  />
                </label>
                <br />
                <label>
                <span style={{ color: 'red',margin: '4px'  }}>*</span>
                  Nome:
                  <input type="text" value={name} onChange={handleNameChange} placeholder='Primeiro Nome' required/>
                </label>
                <br />
                <label>
                <span style={{ color: 'red',margin: '4px'  }}>*</span>
                  Setor:
                  <input
                    type="text"
                    value={department}
                    onChange={handleDepartmentChange}
                    required
                    placeholder='Setor'
                  />
                  
                </label>
                <br />
                <button type="submit">Criar Chamado</button>
              </form>
            </div>
          )}



          
           {activePage === 'Cadastrar Usuário' && (
            <SignUp />
           )}





          {activePage === 'Lista de Chamados' && (
            <div>
              <h2>Lista de Chamados</h2>
              {tickets.length === 0 ? (
                <p>Nenhum chamado criado ainda.</p>
              ) : (
                <table className="tickets-table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Nome do Usuário</th>
                      <th>Setor</th>
                      <th>Status</th>
                      <th>Data</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>{ticket.title}</td>
                        <td>{ticket.name}</td>
                        <td>{ticket.department}</td>
                        <td>
                        
                         
                        

                 
                        {ticket.status === 'Pendente' &&
    (new Date().getTime() - new Date(ticket.date).getTime()) > 24 * 60 * 60 * 1000 ? (
      <span className='vermelho'>Atrasado</span>
    ) : (
      <span className={ticket.status.toLowerCase() === 'concluído' ? 'concluido' : ticket.status.toLowerCase()}>{ticket.status}</span>
    )}
                        </td>
                        <td>{formatDate(ticket.date)}</td>
                        <td>
                          <button onClick={() => handleViewTicket(ticket)}>
                            <FaEye  style={{ marginRight: '4px' }} /> Ver Chamado {/* Ícone personalizado */}
                          </button>
                          {ticket.status === 'Concluído' && (
                            
                            <button onClick={handleDeleteTicket}>
                              <FaTrash style={{ marginRight: '4px' }} /> Excluir {/* Ícone personalizado */}
                              
                            </button>
                            
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
            
          {showSuccessMessage && (
            <div className="success-message">
              <FaCheck style={{ marginRight: '4px' }} /> {/* Ícone personalizado */}
              Chamado realizado com sucesso
            </div>
          )}
  
          {showTitle && selectedTicket && (
            <div className="view-ticket">
              <h2>{selectedTicket.title}</h2>
              <p>Descrição: {selectedTicket.description}</p>
              <p>Nome: {selectedTicket.name}</p>
              <p>Setor: {selectedTicket.department}</p>
              {selectedTicket.status === 'Pendente' && (
               
               
                <div className="buttons">
                  <button onClick={handleCompleteTicket}>
                    <FaCheck style={{ marginRight: '4px' }}/> Concluir {/* Ícone personalizado */}
                  </button>
                  <button onClick={handleCloseTicket}>
                  <FaSignOutAlt /> Fechar {/* Ícone personalizado */}
                  </button>
                </div>
                
              )}
             <span>
              </span> {selectedTicket.status === 'Concluído' && (
                
                <div className="buttons">
                  <button onClick={handleDeleteTicket} >
                    <FaTrash style={{ marginRight: '4px' }} /> Excluir {/* Ícone personalizado */}
                  </button>
                  <button onClick={handleCloseTicket}>
                  <FaSignOutAlt style={{ marginRight: '4px' }} /> Fechar {/* Ícone personalizado */}
                  </button>
                </div>
              )}
              {selectedTicket.status === 'Atrasado' && (
                <div className="buttons">
                  <button onClick={handleDeleteTicket}>
                    <FaTrash style={{ marginRight: '4px' }} /> Excluir {/* Ícone personalizado */}
                  </button>
                  <button onClick={handleCloseTicket}>
                  <FaSignOutAlt style={{ marginRight: '4px' }} /> Fechar {/* Ícone personalizado */}
                  </button>
                </div>
              )}
            </div>
          )}
          
        </div>
      </div>
    );
  };

export default TicketSystem;
