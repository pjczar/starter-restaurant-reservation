/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./reservations.controller");


router.route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

router.route('/:reservation_id/status')
    .put(controller.updateStatus)
    .all(methodNotAllowed);

router.route('/:reservation_id')
    .get(controller.read)
    .put(controller.update)
    .all(methodNotAllowed);

module.exports = router;

/**
*Here's a breakdown of the routes:
*
*GET /reservations: This route calls the *controller.list function to retrieve a list of *reservations.
*POST /reservations: This route calls the *controller.create function to create a new *reservation.
*PUT /reservations/:reservation_id/status: This route *calls the controller.updateStatus function to update *the status of a specific reservation.
*GET /reservations/:reservation_id: This route calls *the controller.read function to retrieve a specific *reservation.
*PUT /reservations/:reservation_id: This route calls *the controller.update function to update a specific *reservation.
*The methodNotAllowed function is used as a catch-all *for any other HTTP methods that are not explicitly *defined for these routes.
*/