// src/components/Login.jsx
import { useState } from 'react';

export default function Login({ navigate, onLogin }) {
  const [senha, setSenha] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação da senha direto no frontend!
    if (senha === '2468') {
      onLogin(); // Chama a função no App.jsx para buscar o token
    } else {
      alert('Senha incorreta! Dica: a senha é 123');
    }
  };

  return (
    <div>
      <button className="btn-back" onClick={() => navigate('home')}>
        ← Voltar
      </button>
      <h2>Entrar no Sistema do My Bolo</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input 
            type="password" 
            placeholder="Digite sua senha" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
        
        <button type="submit" className="btn btn-primary">
          Acessar
        </button>
      </form>
    </div>
  );
}