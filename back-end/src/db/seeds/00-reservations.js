const reservations = require('../fixtures/00-reservations');

exports.seed = function (knex) {
  return knex
    .raw("TRUNCATE TABLE reservations RESTART IDENTITY CASCADE")
    .then(function () {
      return knex('reservations').insert(reservations);
    });
};