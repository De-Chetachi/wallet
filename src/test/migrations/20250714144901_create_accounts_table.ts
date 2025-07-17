import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('accounts', (table) => {
        table.string('id').primary().notNullable();
        table.string('user').references('users.id');
        table.string('account_number').notNullable();
        table.float('balance').defaultTo(0.0);
        table.string('currency').defaultTo('#');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
        //table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
}
export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('accounts');
}

