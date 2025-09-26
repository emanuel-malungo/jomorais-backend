#!/bin/bash

# Script para configurar e executar o projeto JoMorais Backend

echo "🚀 Configurando ambiente JoMorais Backend..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Copiar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado. Por favor, configure as variáveis necessárias."
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Remover volumes antigos (opcional - descomente se quiser resetar o banco)
# echo "🗑️  Removendo volumes antigos..."
# docker-compose down -v

# Construir e iniciar os containers
echo "🏗️  Construindo containers..."
docker-compose build

echo "🚀 Iniciando serviços..."
docker-compose up -d

# Aguardar o MySQL estar pronto
echo "⏳ Aguardando MySQL estar pronto..."
sleep 30

# Verificar status dos containers
echo "📊 Status dos containers:"
docker-compose ps

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "🌐 Serviços disponíveis:"
echo "   - API: http://localhost:3000"
echo "   - phpMyAdmin: http://localhost:8080"
echo "   - MySQL: localhost:3306"
echo ""
echo "📝 Credenciais do banco:"
echo "   - Usuário: jomorais_user"
echo "   - Senha: jomorais_password"
echo "   - Base de dados: gestao_escolar"
echo ""
echo "🛠️  Comandos úteis:"
echo "   - Ver logs: docker-compose logs -f"
echo "   - Parar: docker-compose down"
echo "   - Reiniciar: docker-compose restart"
echo ""