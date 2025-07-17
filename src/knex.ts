import  knex  from 'knex';
import config from './knex_db/knexfile';
const environment = process.env.NODE_ENV || 'development';


const connection = knex(config[environment]);

export const dbClient = connection;

export default dbClient;