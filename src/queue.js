// arq separado para não afetar performance da aplicação.
// Rodar separada o app do processamento de filas;
import 'dotenv/config';
import Queue from './lib/Queue';

Queue.processQueue();
