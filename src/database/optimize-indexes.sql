-- ⚡ OTIMIZAÇÕES DE PERFORMANCE PARA BUSCA DE ALUNOS
-- Índices para acelerar as consultas de busca

-- Índice para busca por nome de aluno (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_alunos_nome_lower ON tb_alunos (LOWER(nome));

-- Índice para busca por documento de identificação
CREATE INDEX IF NOT EXISTS idx_alunos_documento ON tb_alunos (n_documento_identificacao);

-- Índice composto para confirmações com status
CREATE INDEX IF NOT EXISTS idx_confirmacoes_status_data ON tb_confirmacoes (codigo_Status, data_Confirmacao DESC);

-- Índice para relacionamento matrícula-aluno
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno ON tb_matriculas (codigo_Aluno);

-- Índice para relacionamento confirmação-matrícula
CREATE INDEX IF NOT EXISTS idx_confirmacoes_matricula ON tb_confirmacoes (codigo_Matricula);

-- Índice para relacionamento confirmação-turma
CREATE INDEX IF NOT EXISTS idx_confirmacoes_turma ON tb_confirmacoes (codigo_Turma);

-- Índice para relacionamento matrícula-curso
CREATE INDEX IF NOT EXISTS idx_matriculas_curso ON tb_matriculas (codigo_Curso);

-- Índice composto para busca otimizada de alunos confirmados
CREATE INDEX IF NOT EXISTS idx_alunos_confirmados_search ON tb_alunos (nome, n_documento_identificacao, codigo);

-- Estatísticas para otimização do query planner
ANALYZE tb_alunos;
ANALYZE tb_matriculas;
ANALYZE tb_confirmacoes;
ANALYZE tb_turmas;
ANALYZE tb_cursos;

-- Verificar índices criados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('tb_alunos', 'tb_matriculas', 'tb_confirmacoes', 'tb_turmas', 'tb_cursos')
ORDER BY tablename, indexname;
