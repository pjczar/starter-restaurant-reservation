const tables = require('../fixtures/01-tables');

exports.seed = function (knex) {
    return knex
        .raw('TRUNCATE TABLE tables RESTART IDENTITY CASCADE')
        .then(function () {
            return knex('tables').insert(tables);
        });
};