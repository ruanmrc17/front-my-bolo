// src/components/Register.jsx
import { useState } from 'react';

export default function Register({ navigate, onRegister }) {
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!matricula) {
      alert('A matrícula é obrigatória!');
      return;
    }
    
    onRegister({ 
      nome: nome || 'Sem Nome', 
      matricula 
    });
  };

  return (
    <div>
      <button className="btn-back" onClick={() => navigate('dashboard')}>
        ← Voltar
      </button>
      <h2>Novo Cadastro</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Nome do Aluno (Opcional)" 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Matrícula (Obrigatório)*" 
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
          />
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Cadastrar
        </button>
      </form>
    </div>
  );
}