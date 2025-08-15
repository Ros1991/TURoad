-- Script para criar o banco de dados TURoad
-- Execute este script no PostgreSQL como usuário postgres

-- Criar o banco de dados
CREATE DATABASE turoad_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- Conectar ao banco e criar schema se necessário  
\c turoad_db;
CREATE SCHEMA IF NOT EXISTS public;

-- Comentários informativos
COMMENT ON DATABASE turoad_db IS 'Banco de dados do sistema TURoad - Gerenciamento de Turismo';
