-- CreateTable
CREATE TABLE "Aluno" (
    "id_aluno" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "data_nascimento" DATETIME NOT NULL,
    "genero" TEXT NOT NULL,
    "nome_encarregado" TEXT NOT NULL,
    "contato_encarregado" TEXT NOT NULL,
    "numero_matricula" TEXT NOT NULL,
    "estado_financeiro" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Sala" (
    "id_sala" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome_sala" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Turma" (
    "id_turma" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome_turma" TEXT NOT NULL,
    "turno" TEXT NOT NULL,
    "id_sala" INTEGER NOT NULL,
    CONSTRAINT "Turma_id_sala_fkey" FOREIGN KEY ("id_sala") REFERENCES "Sala" ("id_sala") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Classe" (
    "id_classe" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome_classe" TEXT NOT NULL,
    "ciclo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Curso" (
    "id_curso" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome_curso" TEXT NOT NULL,
    "descricao" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Matricula" (
    "id_matricula" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_aluno" INTEGER NOT NULL,
    "id_turma" INTEGER NOT NULL,
    "id_classe" INTEGER NOT NULL,
    "id_curso" INTEGER,
    "ano_letivo" TEXT NOT NULL,
    "data_matricula" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Matricula_id_aluno_fkey" FOREIGN KEY ("id_aluno") REFERENCES "Aluno" ("id_aluno") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Matricula_id_turma_fkey" FOREIGN KEY ("id_turma") REFERENCES "Turma" ("id_turma") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Matricula_id_classe_fkey" FOREIGN KEY ("id_classe") REFERENCES "Classe" ("id_classe") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Matricula_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "Curso" ("id_curso") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id_pagamento" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_matricula" INTEGER NOT NULL,
    "mes_referente" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "data_pagamento" DATETIME NOT NULL,
    "id_funcionario" INTEGER NOT NULL,
    "comprovativo_fatura" TEXT NOT NULL,
    CONSTRAINT "Pagamento_id_matricula_fkey" FOREIGN KEY ("id_matricula") REFERENCES "Matricula" ("id_matricula") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pagamento_id_funcionario_fkey" FOREIGN KEY ("id_funcionario") REFERENCES "Funcionario" ("id_funcionario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Funcionario" (
    "id_funcionario" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nivel_acesso" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Disciplina" (
    "id_disciplina" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome_disciplina" TEXT NOT NULL,
    "id_curso" INTEGER,
    CONSTRAINT "Disciplina_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "Curso" ("id_curso") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Nota" (
    "id_nota" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_matricula" INTEGER NOT NULL,
    "id_disciplina" INTEGER NOT NULL,
    "id_funcionario" INTEGER NOT NULL,
    "periodo" TEXT NOT NULL,
    "valor_nota" REAL NOT NULL,
    CONSTRAINT "Nota_id_matricula_fkey" FOREIGN KEY ("id_matricula") REFERENCES "Matricula" ("id_matricula") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Nota_id_disciplina_fkey" FOREIGN KEY ("id_disciplina") REFERENCES "Disciplina" ("id_disciplina") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Nota_id_funcionario_fkey" FOREIGN KEY ("id_funcionario") REFERENCES "Funcionario" ("id_funcionario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Documento" (
    "id_documento" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_aluno" INTEGER NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "arquivo" TEXT NOT NULL,
    "data_upload" DATETIME NOT NULL,
    CONSTRAINT "Documento_id_aluno_fkey" FOREIGN KEY ("id_aluno") REFERENCES "Aluno" ("id_aluno") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_numero_matricula_key" ON "Aluno"("numero_matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Funcionario_username_key" ON "Funcionario"("username");
