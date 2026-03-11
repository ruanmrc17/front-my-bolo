// src/App.jsx
import { useState, useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [students, setStudents] = useState([]);
  
  // Guardamos o token no estado, buscando do localStorage
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // BUSCAR ALUNOS: Agora só busca se existir um token
  useEffect(() => {
    if (token) {
      setCurrentScreen('dashboard'); // Persistência: se tem token, vai pro dashboard
      
      fetch('https://back-my-bolo.onrender.com/alunos', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(resposta => {
          if (!resposta.ok) throw new Error('Token inválido ou expirado');
          return resposta.json();
        })
        .then(dados => setStudents(dados))
        .catch(erro => {
          console.error("Erro ao buscar alunos:", erro);
          handleLogout();
        });
    }
  }, [token]);

  // FUNÇÃO DE LOGIN (Chamada quando a senha 123 estiver correta)
  const handleLogin = async () => {
    try {
      // Pede um token genérico ao backend
      const resposta = await fetch('https://back-my-bolo.onrender.com/login', {
        method: 'POST',
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        setToken(dados.token); 
        localStorage.setItem('token', dados.token); // Salva no navegador
        setCurrentScreen('dashboard'); // Muda para o dashboard
      }
    } catch (erro) {
      alert('Erro de conexão com o servidor.');
      console.error(erro);
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
      const resposta = await fetch('https://back-my-bolo.onrender.com/alunos', {
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

  const handleUpdatePoints = async (id, newPoints) => {
    try {
      const resposta = await fetch(`https://back-my-bolo.onrender.com/alunos/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pontos: newPoints })
      });

      if (resposta.ok) {
        const alunoAtualizado = await resposta.json();
        setStudents(students.map(student => 
          student._id === id ? alunoAtualizado : student
        ));
      }
    } catch (erro) {
      console.error("Erro ao atualizar pontos:", erro);
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
          updatePoints={handleUpdatePoints} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
}

export default App;