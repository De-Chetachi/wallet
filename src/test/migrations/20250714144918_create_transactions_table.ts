import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('transactions', (table) => {
        table.string('id').primary().unique();
        table.string('account').references('accounts.id');
        table.float('amount').notNullable();
        table.string('type').notNullable();
        table.string('status').notNullable();
        table.string('receiver');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    } )
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('transactions');
}

