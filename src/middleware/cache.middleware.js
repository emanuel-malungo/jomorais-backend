const NodeCache = require('node-cache');

// ⚡ CACHE EM MEMÓRIA PARA OTIMIZAR CONSULTAS FREQUENTES
// TTL: 2 minutos para dados dinâmicos, 10 minutos para dados estáticos
const cache = new NodeCache({ 
  stdTTL: 120, // 2 minutos padrão
  checkperiod: 60, // Verificar expiração a cada 1 minuto
  useClones: false // Melhor performance
});

// Cache específico para buscas de alunos (mais agressivo)
const studentsCache = new NodeCache({ 
  stdTTL: 60, // 1 minuto para buscas
  checkperiod: 30,
  useClones: false,
  maxKeys: 100 // Máximo 100 buscas em cache
});

/**
 * Middleware de cache para rotas específicas
 */
const cacheMiddleware = (duration = 120, cacheType = 'default') => {
  return (req, res, next) => {
    // Só aplicar cache em métodos GET
    if (req.method !== 'GET') {
      return next();
    }

    // Criar chave única baseada na URL e query params
    const key = `${req.originalUrl}_${JSON.stringify(req.query)}`;
    
    // Escolher o cache apropriado
    const selectedCache = cacheType === 'students' ? studentsCache : cache;
    
    // Verificar se existe no cache
    const cachedResponse = selectedCache.get(key);
    
    if (cachedResponse) {
      console.log(`⚡ Cache HIT: ${key}`);
      
      // Adicionar headers de cache
      res.set({
        'X-Cache': 'HIT',
        'X-Cache-Key': key,
        'Cache-Control': `public, max-age=${duration}`
      });
      
      return res.json(cachedResponse);
    }

    console.log(`🔄 Cache MISS: ${key}`);
    
    // Interceptar o response para salvar no cache
    const originalJson = res.json;
    res.json = function(data) {
      // Só cachear respostas de sucesso
      if (data && data.success) {
        selectedCache.set(key, data, duration);
        console.log(`💾 Salvando no cache: ${key} (TTL: ${duration}s)`);
      }
      
      // Adicionar headers de cache
      res.set({
        'X-Cache': 'MISS',
        'X-Cache-Key': key,
        'Cache-Control': `public, max-age=${duration}`
      });
      
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Cache específico para busca de alunos confirmados
 */
const studentsSearchCache = cacheMiddleware(60, 'students'); // 1 minuto

/**
 * Cache para dados estáticos (cursos, turmas, etc.)
 */
const staticDataCache = cacheMiddleware(600); // 10 minutos

/**
 * Cache para dados dinâmicos (pagamentos, etc.)
 */
const dynamicDataCache = cacheMiddleware(120); // 2 minutos

/**
 * Limpar cache manualmente
 */
const clearCache = (pattern = null) => {
  if (pattern) {
    // Limpar chaves que correspondem ao padrão
    const keys = cache.keys();
    const studentKeys = studentsCache.keys();
    
    keys.forEach(key => {
      if (key.includes(pattern)) {
        cache.del(key);
        console.log(`🗑️ Cache removido: ${key}`);
      }
    });
    
    studentKeys.forEach(key => {
      if (key.includes(pattern)) {
        studentsCache.del(key);
        console.log(`🗑️ Students cache removido: ${key}`);
      }
    });
  } else {
    // Limpar todo o cache
    cache.flushAll();
    studentsCache.flushAll();
    console.log('🗑️ Todo o cache foi limpo');
  }
};

/**
 * Estatísticas do cache
 */
const getCacheStats = () => {
  return {
    default: {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses,
      hitRate: cache.getStats().hits / (cache.getStats().hits + cache.getStats().misses) * 100
    },
    students: {
      keys: studentsCache.keys().length,
      hits: studentsCache.getStats().hits,
      misses: studentsCache.getStats().misses,
      hitRate: studentsCache.getStats().hits / (studentsCache.getStats().hits + studentsCache.getStats().misses) * 100
    }
  };
};

/**
 * Middleware para invalidar cache quando dados são modificados
 */
const invalidateCacheMiddleware = (patterns = []) => {
  return (req, res, next) => {
    // Interceptar response para invalidar cache após operações de escrita
    const originalJson = res.json;
    res.json = function(data) {
      if (data && data.success && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        patterns.forEach(pattern => {
          clearCache(pattern);
        });
        console.log(`🔄 Cache invalidado para padrões: ${patterns.join(', ')}`);
      }
      return originalJson.call(this, data);
    };
    next();
  };
};

module.exports = {
  cacheMiddleware,
  studentsSearchCache,
  staticDataCache,
  dynamicDataCache,
  clearCache,
  getCacheStats,
  invalidateCacheMiddleware
};
