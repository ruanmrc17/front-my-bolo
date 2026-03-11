// src/components/Dashboard.jsx
import { useState } from 'react';

// Recebendo a prop onLogout
export default function Dashboard({ navigate, students, updatePoints, onLogout }) {
  const [search, setSearch] = useState('');

  const filteredStudents = students.filter(student => 
    student.nome.toLowerCase().includes(search.toLowerCase()) || 
    student.matricula.includes(search)
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard</h2>
        {/* 👈 Alterado para chamar onLogout ao invés de só trocar de tela */}
        <button className="btn-back" onClick={onLogout}>Sair</button>
      </div>

      <button 
        className="btn btn-primary" 
        style={{ marginBottom: '20px' }}
        onClick={() => navigate('register')}
      >
        + Cadastrar Novo Aluno
      </button>

      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Pesquisar por nome ou matrícula..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="students-list">
        {filteredStudents.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>Nenhum aluno encontrado.</p>
        ) : (
          filteredStudents.map(student => (
            <div key={student._id} className="student-card">
              <div className="student-info">
                <h4>{student.nome}</h4>
                <p>Matrícula: {student.matricula}</p>
              </div>
              
              <div className="student-actions">
                <div className="student-points">
                  {student.pontos} pts
                </div>
                <div className="action-buttons">
                  <button 
                    className="btn-add"
                    onClick={() => updatePoints(student._id, student.pontos + 1)}
                  >
                    +1 Ponto
                  </button>
                  <button 
                    className="btn-reset"
                    onClick={() => updatePoints(student._id, 0)} 
                  >
                    Zerar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}