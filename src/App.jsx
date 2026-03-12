// src/App.jsx
import { useState, useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const API_URL = "https://back-my-bolo.onrender.com"; // Lembre de mudar para o link do Render depois!

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [students, setStudents] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) {
      setCurrentScreen('dashboard');
      fetch(`${API_URL}/alunos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(resposta => {
          if (!resposta.ok) throw new Error('Token inválido');
          return resposta.json();
        })
        .then(dados => setStudents(dados))
        .catch(erro => {
          console.error(erro);
          handleLogout();
        });
    }
  }, [token]);

  const handleLogin = async () => {
    try {
      const resposta = await fetch(`${API_URL}/login`, { method: 'POST' });
      const dados = await resposta.json();

      if (resposta.ok) {
        setToken(dados.token); 
        localStorage.setItem('token', dados.token);
        setCurrentScreen('dashboard');
      }
    } catch (erro) {
      alert('Erro de conexão.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setStudents([]);
    setCurrentScreen('home');
  };

  const handleRegister = async (student) => {
    try {
      const resposta = await fetch(`${API_URL}/alunos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: student.nome,
          matricula: student.matricula,
          pontos: 0
        })
      });
      const novoAluno = await resposta.json();
      setStudents([...students, novoAluno]);
      alert('Aluno cadastrado com sucesso!');
      setCurrentScreen('dashboard');
    } catch (erro) {
      alert('Erro ao cadastrar aluno!');
    }
  };

  const handleUpdateStudent = async (id, dadosAtualizados) => {
    try {
      const resposta = await fetch(`${API_URL}/alunos/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosAtualizados) 
      });

      if (resposta.ok) {
        const alunoAtualizado = await resposta.json();
        setStudents(students.map(student => 
          student._id === id ? alunoAtualizado : student
        ));
      }
    } catch (erro) {
      console.error("Erro ao atualizar aluno:", erro);
    }
  };

  // 🗑️ NOVA FUNÇÃO: Deletar Aluno
  const handleDeleteStudent = async (id) => {
    // Confirmação de segurança para não apagar sem querer
    const confirmacao = window.confirm("Tem certeza que deseja excluir este aluno?");
    if (!confirmacao) return;

    try {
      const resposta = await fetch(`${API_URL}/alunos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (resposta.ok) {
        // Tira o aluno da lista da tela
        setStudents(students.filter(student => student._id !== id));
      } else {
        alert("Erro ao excluir aluno.");
      }
    } catch (erro) {
      console.error("Erro ao excluir aluno:", erro);
    }
  };

  return (
    <div className="app-container">
      {currentScreen === 'home' && <Home navigate={setCurrentScreen} />}
      {currentScreen === 'register' && <Register navigate={setCurrentScreen} onRegister={handleRegister} />}
      {currentScreen === 'login' && <Login navigate={setCurrentScreen} onLogin={handleLogin} />}
      {currentScreen === 'dashboard' && (
        <Dashboard 
          navigate={setCurrentScreen} 
          students={students} 
          updateStudent={handleUpdateStudent} 
          deleteStudent={handleDeleteStudent} // 👈 Passando a nova função pro Dashboard
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
}

export default App;