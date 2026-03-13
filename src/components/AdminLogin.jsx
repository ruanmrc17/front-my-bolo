// src/components/AdminLogin.jsx
import { useState } from 'react';

export default function AdminLogin({ navigate, onLogin }) {
  const [senha, setSenha] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (senha === '7183') {
      onLogin(); 
    } else {
      alert('Senha de administrador incorreta!');
    }
  };

  return (
    <div>
      <button className="btn-back" onClick={() => navigate('home')}>
        ← Voltar
      </button>
      <h2>Acesso Administrativo</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input 
            type="password" 
            placeholder="Senha da Administração" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#475569' }}>
          Acessar Painel
        </button>
      </form>
    </div>
  );
}