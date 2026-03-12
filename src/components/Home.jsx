// src/components/Home.jsx
export default function Home({ navigate }) {
  return (
    <div style={{ marginTop: '50px' }}>
      <h1>Bem-vindo ao My Bolo</h1>
      <p style={{ textAlign: 'center', marginBottom: '40px' }}>
        Sistema de Gestão de Alunos
      </p>
      
      {/* Botão de Entrar virou o principal */}
      <button 
        className="btn btn-primary" 
        onClick={() => navigate('login')}
      >
        Entrar no Sistema
      </button>
    </div>
  );
}