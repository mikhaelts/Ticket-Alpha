const functions = require('firebase-functions');
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgMCFIZ_LNbSyRLr7QShKqJRtiVogjt7o",
  authDomain: "chamado-alpha.firebaseapp.com",
  projectId: "chamado-alpha",
  storageBucket: "chamado-alpha.appspot.com",
  messagingSenderId: "972707844687",
  appId: "1:972707844687:web:35275a5473d3faef2c103a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const sendEmail = async (ticket) => {
  
  
    const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'contatos@alpha.edu.br', // Insira seu e-mail para envio
        pass: '9090@.Alpha23' // Insira a senha do e-mail para envio
    }
  });

  const mailOptions = {
    from: 'contatos@alpha.edu.br',
    to: 'mikhaeltellys@gmail.com', // Insira o e-mail do destinatário
    subject: `Novo chamado: ${ticket.title}`,
    html: `<p>Um novo chamado foi criado:</p>
      <p>Título: ${ticket.title}</p>
      <p>Descrição: ${ticket.description}</p>
      <p>Nome: ${ticket.name}</p>
      <p>Setor: ${ticket.department}</p>
      <p>Data: ${ticket.date}</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar o e-mail:', error);
  }
};

exports.sendEmailOnNewTicket = functions.firestore
  .document('chamados/{ticketId}')
  .onCreate((snapshot, context) => {
    const newTicket = snapshot.data();
    return sendEmail(newTicket);
  });
