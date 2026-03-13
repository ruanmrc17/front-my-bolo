// src/components/AdminDashboard.jsx
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; 

export default function AdminDashboard({ 
  navigate, 
  transactions, 
  onLogout, 
  onDeleteTransaction, 
  onUpdateTransaction, 
  onDeleteMonthTransactions 
}) {
  const [filterType, setFilterType] = useState('dia'); 
  const [filterValue, setFilterValue] = useState(''); 
  const [searchName, setSearchName] = useState('');

  // Estados para Edição de um item
  const [editingId, setEditingId] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editData, setEditData] = useState('');
  const [editQtd, setEditQtd] = useState(1);
  const [editValor, setEditValor] = useState('');
  const [editTipo, setEditTipo] = useState('custo');

  // Estados para apagar um mês inteiro
  const [showDeleteArea, setShowDeleteArea] = useState(false);
  const [deleteMonthValue, setDeleteMonthValue] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // 1. FILTRO DE DATA
  const transactionsByDate = transactions.filter(t => {
    if (!filterValue) return true; 
    if (filterType === 'mes') {
      return t.data.startsWith(filterValue);
    } else {
      return t.data === filterValue;
    }
  });

  // TOTAIS GERAIS
  const totalCustosGeral = transactionsByDate
    .filter(t => t.tipo === 'custo')
    .reduce((acc, curr) => acc + (curr.quantidade * curr.valor), 0);

  const totalRecebidosGeral = transactionsByDate
    .filter(t => t.tipo === 'recebido')
    .reduce((acc, curr) => acc + (curr.quantidade * curr.valor), 0);

  const saldoGeral = totalRecebidosGeral - totalCustosGeral;

  // 2. FILTRO DE PESQUISA (NOME)
  const displayedTransactions = transactionsByDate.filter(t =>
    t.nome.toLowerCase().includes(searchName.toLowerCase())
  );

  // Formata a data para DD/MM/YYYY
  const formatarData = (dataIso) => {
    if (!dataIso) return '';
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // Funções de Edição
  const startEditing = (t) => {
    setEditingId(t._id);
    setEditNome(t.nome);
    setEditData(t.data);
    setEditQtd(t.quantidade);
    setEditValor(t.valor);
    setEditTipo(t.tipo);
  };

  const saveEdit = (id) => {
    onUpdateTransaction(id, {
      nome: editNome,
      data: editData,
      quantidade: Number(editQtd),
      valor: Number(editValor),
      tipo: editTipo
    });
    setEditingId(null);
  };

  // 📄 FUNÇÃO PARA GERAR O PDF (AGORA COM SALDO TOTAL)
  const gerarPDF = (transacoesDoMes, mesAno) => {
    try {
      const doc = new jsPDF();
      const [ano, mes] = mesAno.split('-');
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      
      // Título do PDF
      doc.setFontSize(18);
      doc.setTextColor(219, 39, 119); // Rosa do My Bolo
      doc.text(`My Bolo - Relatório de ${mes}/${ano}`, 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${dataAtual}`, 14, 28);

      // Separando os dados
      const recebidos = transacoesDoMes.filter(t => t.tipo === 'recebido');
      const custos = transacoesDoMes.filter(t => t.tipo === 'custo');

      // 🆕 CÁLCULO DOS TOTAIS DO PDF
      const totalRecebidosPDF = recebidos.reduce((acc, curr) => acc + (curr.quantidade * curr.valor), 0);
      const totalCustosPDF = custos.reduce((acc, curr) => acc + (curr.quantidade * curr.valor), 0);
      const saldoPDF = totalRecebidosPDF - totalCustosPDF;

      let startY = 35;

      // 🟢 Tabela de Recebidos
      if (recebidos.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(22, 101, 52); 
        doc.text("Recebidos (Entradas)", 14, startY);
        
        autoTable(doc, {
          startY: startY + 5,
          head: [['Data', 'Descrição', 'Qtd', 'Valor Unit.', 'Total']],
          body: recebidos.map(t => [
            formatarData(t.data),
            t.nome,
            t.quantidade,
            `R$ ${Number(t.valor).toFixed(2)}`,
            `R$ ${(t.quantidade * t.valor).toFixed(2)}`
          ]),
          headStyles: { fillColor: [16, 185, 129] },
          theme: 'grid',
        });
        startY = doc.lastAutoTable.finalY + 15; 
      }

      // 🔴 Tabela de Custos
      if (custos.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(153, 27, 27); 
        doc.text("Custos (Saídas)", 14, startY);
        
        autoTable(doc, {
          startY: startY + 5,
          head: [['Data', 'Descrição', 'Qtd', 'Valor Unit.', 'Total']],
          body: custos.map(t => [
            formatarData(t.data),
            t.nome,
            t.quantidade,
            `R$ ${Number(t.valor).toFixed(2)}`,
            `R$ ${(t.quantidade * t.valor).toFixed(2)}`
          ]),
          headStyles: { fillColor: [239, 68, 68] },
          theme: 'grid',
        });
        startY = doc.lastAutoTable.finalY + 15; // Atualiza a posição após os custos
      }

      // 🆕 RESUMO FINANCEIRO NO FINAL DO PDF
      // Se a folha acabar, cria uma página nova pro resumo não cortar
      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }

      // Caixa de Resumo
      doc.setFontSize(16);
      doc.setTextColor(51, 65, 85);
      doc.text("Resumo do Mês", 14, startY);

      doc.setFontSize(12);
      
      // Texto Recebidos
      doc.setTextColor(22, 101, 52);
      doc.text(`Total Recebido: R$ ${totalRecebidosPDF.toFixed(2)}`, 14, startY + 10);
      
      // Texto Custos
      doc.setTextColor(153, 27, 27);
      doc.text(`Total de Custos: R$ ${totalCustosPDF.toFixed(2)}`, 14, startY + 18);

      // Texto Saldo Final
      if (saldoPDF >= 0) {
        doc.setTextColor(22, 101, 52); // Verde se positivo/zero
      } else {
        doc.setTextColor(153, 27, 27); // Vermelho se negativo
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Saldo Final: R$ ${saldoPDF.toFixed(2)}`, 14, startY + 28);

      // Baixa o arquivo PDF
      doc.save(`Relatorio_MyBolo_${mes}_${ano}.pdf`);
      return true; 
      
    } catch (erro) {
      console.error("Erro ao tentar gerar o PDF:", erro);
      alert("Falha ao gerar o PDF. Verifique se as bibliotecas estão instaladas corretamente.");
      return false; 
    }
  };

  // Função de Apagar Mês com PDF
  const handleDeleteMonth = () => {
    if (!deleteMonthValue) {
      alert("Escolha um mês para apagar.");
      return;
    }
    if (deleteConfirmText.toLowerCase() !== 'deletar') {
      alert("Você precisa digitar a palavra 'deletar' corretamente para confirmar.");
      return;
    }

    const transacoesDoMes = transactions.filter(t => t.data.startsWith(deleteMonthValue));

    if (transacoesDoMes.length === 0) {
      const confirmaVazio = window.confirm("Não há nenhum registro neste mês. Deseja continuar?");
      if (!confirmaVazio) return;
    } else {
      // TENTA GERAR O PDF PRIMEIRO
      const pdfSucesso = gerarPDF(transacoesDoMes, deleteMonthValue);
      
      // Se der erro no PDF, TRAVA a exclusão
      if (!pdfSucesso) return; 
    }
    
    // Se o PDF baixou, apaga do banco de dados
    onDeleteMonthTransactions(deleteMonthValue);
    
    // Limpa os campos
    setDeleteMonthValue('');
    setDeleteConfirmText('');
    setShowDeleteArea(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginBottom: 0, color: '#db2777' }}>Painel Financeiro</h2>
        <button className="btn-back" style={{ marginBottom: 0 }} onClick={onLogout}>Sair</button>
      </div>

      <button 
        className="btn btn-primary" 
        style={{ marginTop: '20px', marginBottom: '20px', backgroundColor: '#10b981', borderColor: '#10b981' }}
        onClick={() => navigate('adminRegister')}
      >
        + Cadastrar Custo / Valor
      </button>

      {/* FILTROS */}
      <div className="filter-container">
        <h4 style={{ margin: '0 0 10px 0', color: '#334155' }}>Filtros</h4>
        
        <input 
          type="text" 
          placeholder="Pesquisar produto (ex: Bolo de Cenoura)" 
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{ marginBottom: '10px' }}
        />

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select 
            value={filterType} 
            onChange={(e) => { setFilterType(e.target.value); setFilterValue(''); }}
            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', flex: 1, minWidth: '120px' }}
          >
            <option value="dia">Filtrar por Dia</option>
            <option value="mes">Filtrar por Mês</option>
          </select>

          {filterType === 'mes' ? (
            <input 
              type="month" 
              value={filterValue} 
              onChange={(e) => setFilterValue(e.target.value)}
              style={{ flex: 2, minWidth: '140px' }}
            />
          ) : (
            <input 
              type="date" 
              value={filterValue} 
              onChange={(e) => setFilterValue(e.target.value)}
              style={{ flex: 2, minWidth: '140px' }}
            />
          )}
        </div>
        
        <button className="btn-reset" style={{ marginTop: '10px', width: '100%', padding: '8px' }} onClick={() => { setFilterValue(''); setSearchName(''); }}>
          Limpar Filtros
        </button>
      </div>

      {/* RESUMO FINANCEIRO */}
      <div className="summary-boxes">
        <div className="summary-box" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
          <strong>Custos</strong>
          <span>R$ {totalCustosGeral.toFixed(2)}</span>
        </div>
        <div className="summary-box" style={{ backgroundColor: '#dcfce3', color: '#166534' }}>
          <strong>Recebidos</strong>
          <span>R$ {totalRecebidosGeral.toFixed(2)}</span>
        </div>
        <div className="summary-box" style={{ backgroundColor: saldoGeral >= 0 ? '#dcfce3' : '#fee2e2', color: saldoGeral >= 0 ? '#166534' : '#991b1b' }}>
          <strong>Saldo</strong>
          <span>R$ {saldoGeral.toFixed(2)}</span>
        </div>
      </div>

      {/* LISTA DE REGISTROS */}
      <div className="students-list">
        {displayedTransactions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>Nenhum registro encontrado.</p>
        ) : (
          displayedTransactions.map(t => (
            <div 
              key={t._id} 
              className="student-card transaction-card" 
              style={{ borderLeft: `5px solid ${t.tipo === 'custo' ? '#ef4444' : '#10b981'}`, flexDirection: 'column', alignItems: 'stretch' }}
            >
              {/* EDIÇÃO */}
              {editingId === t._id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  <select value={editTipo} onChange={(e) => setEditTipo(e.target.value)} style={{ padding: '5px' }}>
                    <option value="custo">Custo (Saída)</option>
                    <option value="recebido">Recebido (Entrada)</option>
                  </select>
                  <input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} placeholder="Nome" />
                  <input type="date" value={editData} onChange={(e) => setEditData(e.target.value)} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" min="1" value={editQtd} onChange={(e) => setEditQtd(e.target.value)} style={{ flex: 1 }} placeholder="Qtd" />
                    <input type="number" step="0.01" value={editValor} onChange={(e) => setEditValor(e.target.value)} style={{ flex: 2 }} placeholder="Valor (R$)" />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" style={{ flex: 1, padding: '8px' }} onClick={() => saveEdit(t._id)}>Salvar</button>
                    <button className="btn-reset" style={{ flex: 1, padding: '8px' }} onClick={() => setEditingId(null)}>Cancelar</button>
                  </div>
                </div>
              ) : (
                /* EXIBIÇÃO NORMAL */
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div className="student-info">
                    <h4 style={{ color: t.tipo === 'custo' ? '#ef4444' : '#10b981' }}>{t.nome}</h4>
                    <p>Data: {formatarData(t.data)}</p>
                    <p>Qtd: {t.quantidade} x R$ {Number(t.valor).toFixed(2)}</p>
                  </div>
                  
                  <div className="student-actions" style={{ gap: '5px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: t.tipo === 'custo' ? '#ef4444' : '#10b981' }}>
                      {t.tipo === 'custo' ? '-' : '+'} R$ {(t.quantidade * t.valor).toFixed(2)}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button onClick={() => startEditing(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Editar">✏️</button>
                      <button onClick={() => onDeleteTransaction(t._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Excluir">🗑️</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* BOTÃO PARA MOSTRAR ÁREA DE DELETAR MÊS */}
      {!showDeleteArea && (
        <button 
          onClick={() => setShowDeleteArea(true)}
          style={{ background: 'none', border: '1px underline #94a3b8', color: '#64748b', cursor: 'pointer', marginTop: '20px', width: '100%', textAlign: 'center' }}
        >
          Opções Avançadas (Fechamento de Mês)
        </button>
      )}

      {/* ÁREA DE PERIGO: APAGAR MÊS */}
      {showDeleteArea && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '15px', borderRadius: '10px', marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ color: '#b91c1c', margin: 0 }}>⚠️ Fechamento de Mês</h4>
            <button onClick={() => setShowDeleteArea(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 'bold' }}>X</button>
          </div>
          
          <p style={{ fontSize: '13px', color: '#7f1d1d', margin: '0 0 10px 0' }}>
            Ao confirmar, um <strong>Relatório em PDF</strong> será baixado e os dados do mês serão <strong>apagados</strong> do sistema.<br/><br/>
            Digite a palavra <strong>deletar</strong> para confirmar.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="month" 
              value={deleteMonthValue} 
              onChange={(e) => setDeleteMonthValue(e.target.value)} 
            />
            <input 
              type="text" 
              placeholder="Digite 'deletar' aqui" 
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
            <button 
              className="btn btn-primary" 
              style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
              onClick={handleDeleteMonth}
            >
              Gerar PDF e Apagar Mês
            </button>
          </div>
        </div>
      )}
    </div>
  );
}