// src/components/Dashboard.jsx
import { useState } from 'react';

// 👉 Recebemos a função deleteStudent
export default function Dashboard({ navigate, students, updateStudent, deleteStudent, onLogout }) {
  const [search, setSearch] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editMatricula, setEditMatricula] = useState('');

  const filteredStudents = students.filter(student => 
    student.nome.toLowerCase().includes(search.toLowerCase()) || 
    student.matricula.includes(search)
  );

  const startEditing = (student) => {
    setEditingId(student._id);
    setEditNome(student.nome);
    setEditMatricula(student.matricula);
  };

  const saveEdit = (id) => {
    updateStudent(id, { nome: editNome, matricula: editMatricula });
    setEditingId(null); 
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Bolo</h2>
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
              
              {editingId === student._id ? (
                <div className="student-info" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <input 
                    type="text" 
                    value={editNome} 
                    onChange={(e) => setEditNome(e.target.value)} 
                    placeholder="Nome"
                  />
                  <input 
                    type="text" 
                    value={editMatricula} 
                    onChange={(e) => setEditMatricula(e.target.value)} 
                    placeholder="Matrícula"
                  />
                  <div style={{ display: 'flex', gap: '5px', marginTop: '5px', flexWrap: 'wrap' }}>
                    <button className="btn-add" onClick={() => saveEdit(student._id)}>Salvar</button>
                    <button className="btn-reset" onClick={() => setEditingId(null)}>Cancelar</button>
                    {/* 🗑️ NOVO BOTÃO DE EXCLUIR */}
                    <button 
                      className="btn-reset" 
                      style={{ backgroundColor: '#791919' }} // Cor vermelha para indicar atenção
                      onClick={() => deleteStudent(student._id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ) : (
                <div className="student-info">
                  <h4>{student.nome}</h4>
                  <p>Matrícula: {student.matricula}</p>
                  <button 
                    style={{ background: 'none', borderBottom: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0, marginTop: '5px', textDecoration: 'underline' }}
                    onClick={() => startEditing(student)}
                  >
                    Editar dados
                  </button>
                </div>
              )}
              
              <div className="student-actions">
                <div className="student-points">
                  {student.pontos} pts
                </div>
                <div className="action-buttons" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn-add"
                    onClick={() => updateStudent(student._id, { pontos: student.pontos + 1 })}
                  >
                    +1
                  </button>
                  <button 
                    className="btn-reset"
                    style={{ backgroundColor: '#f59e0b' }} 
                    onClick={() => {
                      if(student.pontos > 0) updateStudent(student._id, { pontos: student.pontos - 1 })
                    }}
                  >
                    -1
                  </button>
                  <button 
                    className="btn-reset"
                    onClick={() => updateStudent(student._id, { pontos: 0 })} 
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