// lib/db.ts

/* eslint-disable no-var */
import { Pool } from 'pg';

// Declaramos a variável global com o tipo Pool
declare global {
  // eslint-disable-next-line no-unused-vars
  var cachedDbPool: Pool;
}

// A variável principal agora se chama 'db'
let db: Pool;

if (process.env.NODE_ENV === 'production') {
  // Em produção, criamos uma nova instância do Pool e a atribuímos a 'db'
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
} else {
  // Em desenvolvimento, verificamos se o pool já existe no cache global
  if (!global.cachedDbPool) {
    global.cachedDbPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  // Atribuímos a instância do cache (nova ou existente) a 'db'
  db = global.cachedDbPool;
}

// Exportamos a variável 'db' como padrão
export default db;