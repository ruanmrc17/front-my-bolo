// src/App.jsx
import { useState, useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminRegister from './components/AdminRegister';

const API_URL = "https://back-my-bolo.onrender.com"; // Lembre de mudar para o link do Render depois!

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]); 
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  
  // 🆕 NOVA MEMÓRIA: Guarda se quem está logado é o Administrador
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');

  useEffect(() => {
    if (token) {
      // 👈 A mágica acontece aqui: Se for Admin, vai pro painel financeiro. Se não, vai pros alunos.
      setCurrentScreen(isAdmin ? 'adminDashboard' : 'dashboard');
      
      // Busca os alunos
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

      // Busca as transações financeiras
      fetch(`${API_URL}/transacoes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(resposta => resposta.json())
        .then(dados => setTransactions(dados))
        .catch(erro => console.error("Erro ao buscar transações:", erro));
    }
  }, [token, isAdmin]);

  // LOGIN DO ALUNO
  const handleLogin = async () => {
    try {
      const resposta = await fetch(`${API_URL}/login`, { method: 'POST' });
      const dados = await resposta.json();

      if (resposta.ok) {
        setToken(dados.token); 
        localStorage.setItem('token', dados.token);
        
        // 👈 Salva que NÃO é administrador
        localStorage.setItem('isAdmin', 'false');
        setIsAdmin(false);
        setCurrentScreen('dashboard');
      } else {
        alert(dados.error);
      }
    } catch (erro) {
      alert("Erro ao conectar ao servidor.");
    }
  };

  // 🆕 LOGIN DA ADMINISTRAÇÃO
  const handleAdminLogin = async () => {
    try {
      const resposta = await fetch(`${API_URL}/login`, { method: 'POST' });
      const dados = await resposta.json();

      if (resposta.ok) {
        setToken(dados.token); 
        localStorage.setItem('token', dados.token);
        
        // 👈 Salva que É O ADMINISTRADOR
        localStorage.setItem('isAdmin', 'true');
        setIsAdmin(true);
        setCurrentScreen('adminDashboard');
      } else {
        alert(dados.error);
      }
    } catch (erro) {
      alert("Erro ao conectar ao servidor.");
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin'); // 👈 Limpa a memória de admin ao sair
    setIsAdmin(false);
    setCurrentScreen('home');
  };

  const handleRegister = async (student) => {
    try {
      const resposta = await fetch(`${API_URL}/alunos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(student)
      });

      if (resposta.ok) {
        const novoAlunoSalvo = await resposta.json();
        setStudents([...students, novoAlunoSalvo]);
        setCurrentScreen('dashboard');
      }
    } catch (erro) {
      console.error("Erro ao cadastrar:", erro);
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

  const handleDeleteStudent = async (id) => {
    const confirmacao = window.confirm("Tem certeza que deseja excluir este aluno?");
    if (!confirmacao) return;

    try {
      const resposta = await fetch(`${API_URL}/alunos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (resposta.ok) {
        setStudents(students.filter(student => student._id !== id));
      }
    } catch (erro) {
      console.error("Erro ao excluir aluno:", erro);
    }
  };

  // --- FUNÇÕES DA ADMINISTRAÇÃO ---
  const handleAddTransaction = async (novaTransacao) => {
    try {
      const resposta = await fetch(`${API_URL}/transacoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(novaTransacao)
      });

      if (resposta.ok) {
        const transacaoSalva = await resposta.json();
        setTransactions([...transactions, transacaoSalva]);
        setCurrentScreen('adminDashboard');
      } else {
        alert("Erro ao salvar o registro financeiro.");
      }
    } catch (erro) {
      console.error("Erro ao salvar transação:", erro);
    }
  };

  const handleDeleteTransaction = async (id) => {
    const confirmacao = window.confirm("Deseja mesmo excluir este registro financeiro?");
    if (!confirmacao) return;

    try {
      const resposta = await fetch(`${API_URL}/transacoes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (resposta.ok) {
        setTransactions(transactions.filter(t => t._id !== id));
      } else {
        alert("Erro ao excluir registro.");
      }
    } catch (erro) {
      console.error("Erro ao excluir transação:", erro);
    }
  };

  const handleUpdateTransaction = async (id, dadosAtualizados) => {
    try {
      const resposta = await fetch(`${API_URL}/transacoes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosAtualizados)
      });

      if (resposta.ok) {
        const transacaoAtualizada = await resposta.json();
        setTransactions(transactions.map(t => 
          t._id === id ? transacaoAtualizada : t
        ));
      } else {
        alert("Erro ao atualizar o registro.");
      }
    } catch (erro) {
      console.error("Erro ao atualizar transação:", erro);
    }
  };

  // 🆕 NOVA: Deletar tudo de um Mês
  const handleDeleteMonthTransactions = async (anoMes) => {
    try {
      const resposta = await fetch(`${API_URL}/transacoes/mes/${anoMes}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (resposta.ok) {
        // Remove da tela tudo que começa com aquele mês (ex: "2026-03")
        setTransactions(transactions.filter(t => !t.data.startsWith(anoMes)));
        alert('Dados do mês apagados com sucesso!');
      } else {
        alert("Erro ao apagar dados do mês.");
      }
    } catch (erro) {
      console.error("Erro ao excluir mês:", erro);
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
          deleteStudent={handleDeleteStudent} 
          onLogout={handleLogout} 
        />
      )}

      {/* 👈 Passando o handleAdminLogin para a tela de login da Administração */}
      {currentScreen === 'adminLogin' && (
        <AdminLogin navigate={setCurrentScreen} onLogin={handleAdminLogin} />
      )}
      
      {currentScreen === 'adminDashboard' && (
        <AdminDashboard 
          navigate={setCurrentScreen} 
          transactions={transactions} 
          onLogout={handleLogout} 
          onDeleteTransaction={handleDeleteTransaction}
          onUpdateTransaction={handleUpdateTransaction}        // 👈 NOVA
          onDeleteMonthTransactions={handleDeleteMonthTransactions} // 👈 NOVA
        />
      )}
      
      {currentScreen === 'adminRegister' && (
        <AdminRegister 
          navigate={setCurrentScreen} 
          onAddTransaction={handleAddTransaction} 
        />
      )}
    </div>
  );
}

export default App;