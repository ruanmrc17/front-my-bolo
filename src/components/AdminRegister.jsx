// src/components/AdminRegister.jsx
import { useState } from 'react';

export default function AdminRegister({ navigate, onAddTransaction }) {
  const [tipo, setTipo] = useState('recebido');
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [valor, setValor] = useState('');
  
  // Pega a data de hoje ajustada para o fuso horário local
  const hoje = new Date();
  const dataLocal = new Date(hoje.getTime() - (hoje.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  const [data, setData] = useState(dataLocal);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome || !valor || !data) {
      alert('Preencha os campos obrigatórios!');
      return;
    }
    
    onAddTransaction({ 
      tipo, 
      nome, 
      quantidade: Number(quantidade), 
      valor: Number(valor), 
      data 
    });
  };

  return (
    <div>
      <button className="btn-back" onClick={() => navigate('adminDashboard')}>
        ← Voltar
      </button>
      <h2 style={{ marginBottom: '20px' }}>
        Registrar {tipo === 'custo' ? 'Custo' : 'Valor'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        
        <div className="radio-group">
          <label className="radio-label">
            <input 
              type="radio" 
              value="custo" 
              checked={tipo === 'custo'} 
              onChange={() => setTipo('custo')} 
            /> Custo (Saída)
          </label>
          <label className="radio-label">
            <input 
              type="radio" 
              value="recebido" 
              checked={tipo === 'recebido'} 
              onChange={() => setTipo('recebido')} 
            /> Valor (Entrada)
          </label>
        </div>

        <div className="input-group">
          <label>Data do Registro:</label>
          <input 
            type="date" 
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Descrição:</label>
          <input 
            type="text" 
            placeholder={tipo === 'custo' ? 'Ex: Farinha, Ovos...' : 'Ex: Bolo de Cenoura...'} 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        
        <div className="row-inputs">
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Qtd:</label>
            <input 
              type="number" 
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
            <label>Valor Unitário (R$):</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="0.00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ 
            marginTop: '15px', 
            backgroundColor: tipo === 'custo' ? '#ef4444' : '#10b981',
            borderColor: tipo === 'custo' ? '#ef4444' : '#10b981'
          }}
        >
          Salvar {tipo === 'custo' ? 'Custo' : 'Valor'}
        </button>
      </form>
    </div>
  );
}