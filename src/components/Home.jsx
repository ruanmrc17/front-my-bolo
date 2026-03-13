// src/components/Home.jsx
export default function Home({ navigate }) {
  return (
    <div style={{ marginTop: '50px' }}>
      <h1>Bem-vindo ao My Bolo</h1>
      <p style={{ textAlign: 'center', marginBottom: '40px' }}>
        Sistema de Gestão de Alunos e Administração
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('login')}
        >
          Entrar no Sistema (Alunos)
        </button>

        {/* 🆕 Novo botão para Administração */}
        <button 
          className="btn-reset" 
          style={{ backgroundColor: '#475569', color: 'white', padding: '10px 20px', width: '100%', maxWidth: '300px' }}
          onClick={() => navigate('adminLogin')}
        >
          Administração
        </button>
      </div>
    </div>
  );
}