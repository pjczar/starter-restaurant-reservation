const knex = require('../db/connection');

// Function to list reservations for a specific date
const list = (date) =>
    knex('reservations').select().whereNot('status', 'finished').andWhere('reservation_date', date).orderBy('reservation_time');

// Function to list reservations by mobile number
const listByMobileNumber = (mobile_number) =>
    knex("reservations")
        .whereRaw(
            "translate(mobile_number, '() -', '') like ?",
            `%${mobile_number.replace(/\D/g, "")}%`
        )
        .orderBy("reservation_date");

// Function to read a specific reservation by reservation_id        
const read = (reservation_id) =>
    knex('reservations').select().where('reservation_id', reservation_id).first();

// Function to create a new reservation
const create = (newReservation) =>
    knex('reservations').insert(newReservation).returning('*');
    
// Function to update a reservation by reservation_id

const update = (reservation_id, updatedReservation) =>
    knex('reservations').where('reservation_id', reservation_id).update(updatedReservation).returning(['first_name', 'last_name', 'mobile_number', 'people', 'reservation_date', 'reservation_time']);

// Function to update the status of a reservation by reservation_id
    const updateStatus = (reservation_id, status) =>
    knex('reservations').where('reservation_id', reservation_id).update({ status: status }).returning('status');

module.exports = {
    list,
    listByMobileNumber,
    read,
    create,
    update,
    updateStatus
}