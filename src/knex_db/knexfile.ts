import { Knex } from 'knex';

const config: { [key: string]: Knex.Config } = {
    development: {
        client: 'mysql2',
        connection: {
            host: 'localhost',
            user: 'chetachi',
            password: 'cheta1234',
            database: 'test_wallet',
            port: 3306,
        },
        migrations: {
            tableName: 'migrations',
            directory: './src/knex_db/migrations',
        },
        seeds: {
            directory: './seeds',
        },
    },

    test: {
        client: 'mysql2',
        connection: {
            host: 'localhost',
            user: 'chetachi',
            password: 'cheta1234',
            database: 'test_wallet',
            port: 3306,
        },
        migrations: {
            tableName: 'migrations',
            directory: './src/test/migrations',
        },
        seeds: {
            directory: './src/test/seeds',
        },
    },

    production: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: 3306,
        },
        migrations: {
            tableName: 'migrations',
            directory: './src/knex_db/migrations',
        },
    },
};

export default config;