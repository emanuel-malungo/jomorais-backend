import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';

// Importar rotas
import authRoutes from './routes/auth.routes.js';
import userssRoutes from './routes/users.routes.js';
import geographicRoutes from './routes/geographic.routes.js';
import institutionalRoutes from './routes/institutional.routes.js';
import institutionalManagementRoutes from './routes/institutional-management.routes.js';
import academicManagementRoutes from './routes/academic-management.routes.js';

// Importar Swagger
import { swaggerDocs } from './config/swagger.js';

dotenv.config();

const app = express();

// Middlewares globais
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de tratamento de erros globais
app.use((err, req, res, next) => {
  console.error('Erro global:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Jomorais Backend',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      geographic: '/api/geographic',
      institutional: '/api/institutional',
      institutionalManagement: '/api/institutional-management',
      academicManagement: '/api/academic-management',
      docs: '/api/docs'
    }
  });
});

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userssRoutes);
app.use('/api/geographic', geographicRoutes);
app.use('/api/institutional', institutionalRoutes);
app.use('/api/institutional-management', institutionalManagementRoutes);
app.use('/api/academic-management', academicManagementRoutes);

// Documentação Swagger
swaggerDocs(app);

const PORT = process.env.PORT || 8000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em ${BASE_URL}`);
});
