const service = require('./reservations.service');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

/**
 * ID check for exisiting reservations
 */
async function checkId(req, res, next) {
  const { reservation_id } = req.params;
  const data = await service.read(reservation_id);

  if (!data)
    return next({ status: 404, message: `Reservation ID: ${reservation_id} Not Found` });
  else {
    res.locals.reservation = data;
    next();
  }
}

/**
 * Reservation request body validation for new reservations
 */
async function validateNewReservation(req, res, next) {
  if (!req.body.data) return next({ status: 400, message: 'Data Missing!' });

  const { first_name, last_name, mobile_number, people, reservation_date, reservation_time, status } = req.body.data;

  if (!first_name)
    return next({ status: 400, message: 'Be sure to include first_name' });

  if (!last_name)
    return next({ status: 400, message: 'Be sure to include last_name' });

  if (!mobile_number)
    return next({ status: 400, message: 'Be sure to include mobile_number' });

  if (!people)
    return next({ status: 400, message: 'Be sure to include people' });

  if (!reservation_date)
    return next({ status: 400, message: 'Be sure to include reservation_date' });

  if (!reservation_time)
    return next({ status: 400, message: 'Be sure to include reservation_time' });

  if (!reservation_date.match(/\d{4}-\d{2}-\d{2}/))
    return next({ status: 400, message: 'reservation_date is invalid!' });

  if (typeof people !== 'number')
    return next({ status: 400, message: 'people is not a number!' });

  if (status === 'seated')
    return next({ status: 400, message: 'status cannot be seated!' });

  if (status === 'finished')
    return next({ status: 400, message: 'status cannot be finished!' });

  const today = new Date();
  const selectedDate = new Date(reservation_date);

/**  if (selectedDate < today) {
    return next({ status: 400, message: 'Reservation date must be a future date' });
  
  }
*/
  res.locals.reservation = { first_name, last_name, mobile_number, people, reservation_date, reservation_time };
  next();
}



/**write a funtion that gets the timezone of the user and use that in the next function NOT UTC */
function getUserTimezone() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return timezone;
}


/**timezone offset handler */
function getTimezoneOffset(timezone) {
  const now = new Date();
  const timezoneDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  return (now.getTime() - timezoneDate.getTime()) / 60000; // Return the offset in minutes
}

/**date validator v2 */
function dateValidator(req, res, next) {
  const { reservation_date, reservation_time } = res.locals.reservation;
  const [year, month, day] = reservation_date.split("-");
  const date = new Date(`${year}, ${month}, ${day}`);
  const [hour, minute] = reservation_time.split(":");
  const userTimezone = getUserTimezone();
  console.log(userTimezone)

  if (date.getDay() === 2) {
    return next({ status: 400, message: "Location is closed on Tuesdays or today is tuesday" });
  }

  const today = new Date();
  if (date < [month, day, year]) {
    return next({ status: 400, message: "Must be a future date" });
  }

  if (hour < 10 || hour > 21 || (hour < 11 && minute < 30) || (hour > 20 && minute > 30)) {
    return next({
      status: 400,
      message: "Reservation must be made within business hours",
    });
  }

  next();
}




/**
 * Date validation middleware

function dateValidator(req, res, next) {
  const date = new Date(res.locals.reservation.reservation_date);
  const currentDate = new Date();
  const userTimezone = getUserTimezone();
  if (date.getUTCDay() === 2)
    return next({ status: 400, message: "We're closed on Tuesdays!" });

  const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes() - getTimezoneOffset(userTimezone);
  const reservationTime = date.getHours() * 60 + date.getMinutes();

  if (date.toDateString() === currentDate.toDateString() && reservationTime <= currentTime)
    return next({ status: 400, message: "Reservations must be made in the future!" });

  next();
}
*/

// validation middleware: checks that the reservation_date is not a Tuesday
function notTuesday(req, res, next) {
  const { reservation_date } = req.body.data;
  const date = new Date(reservation_date);
  const day = date.getUTCDay();
  if (day === 2) {
    return next({
      status: 400,
      message: "The restaurant is closed on Tuesday.",
    });
  } else {
    return next();
  }
}




/**
 * Timeline validation middleware
 */
function timelineValidator(req, res, next) {
  const time = res.locals.reservation.reservation_time;
  const hour = Number(time.substring(0, 2));
  const minutes = Number(time.substring(3));

  const currentDate = new Date();
  const currentDateHere = currentDate.toLocaleDateString();
  const reservationDate = new Date(res.locals.reservation.reservation_date);
  reservationDate.setHours(hour, minutes, 0, 0);

  const minimumReservationTime = new Date(currentDate.getTime() + 60 * 60 * 1000); // Current time + 1 hour

  if (reservationDate < minimumReservationTime) {
    return next({
      status: 400,
      message: `${reservationDate} ${minimumReservationTime} ${currentDate.toLocaleDateString()} ${currentDateHere} Reservations must be made at least 1 hour in advance.`,
    });
  }

  next();
}

/**
 * Status validation middleware
 */
async function validateStatusUpdate(req, res, next) {
  const currentStatus = res.locals.reservation.status;
  const { status } = req.body.data;

  if (currentStatus === 'finished')
    return next({ status: 400, message: 'a finished reservation cannot be updated' })

  if (status === 'cancelled')
    return next();

  if (status !== 'booked' && status !== 'seated' && status !== 'finished')
    return next({ status: 400, message: 'Can not update unknown status' });

  next();
}

/**
 * Update validation middleware
 */
async function validateUpdate(req, res, next) {
  if (!req.body.data) return next({ status: 400, message: 'Data Missing!' });

  const { first_name, last_name, mobile_number, people, reservation_date, reservation_time } = req.body.data;

  if (!first_name)
    return next({ status: 400, message: 'Be sure to include first_name' });

  if (!last_name)
    return next({ status: 400, message: 'Be sure to include last_name' });

  if (!mobile_number)
    return next({ status: 400, message: 'Be sure to include mobile_number' });

  if (!people)
    return next({ status: 400, message: 'Be sure to include people' });

  if (!reservation_date)
    return next({ status: 400, message: 'Be sure to include reservation_date' });

  if (!reservation_time)
    return next({ status: 400, message: 'Be sure to include reservation_time' });

  if (!reservation_date.match(/\d{4}-\d{2}-\d{2}/))
    return next({ status: 400, message: 'reservation_date is invalid!' });

  if (!reservation_time.match(/\d{2}:\d{2}/))
    return next({ status: 400, message: 'reservation_time is invalid!' });

  if (typeof people !== 'number')
    return next({ status: 400, message: 'people is not a number!' });

  res.locals.reservation = { first_name, last_name, mobile_number, people, reservation_date, reservation_time };

  next();
}

/**
 * List handler for reservation resources
 */
async function list(req, res) {
  const { date, mobile_number } = req.query;

  if (date) {
    const data = await service.list(date);

    res.json({
      data: data,
    });
    return;
  }

  if (mobile_number) {
    const data = await service.listByMobileNumber(mobile_number);

    res.json({
      data: data,
    });

    return;
  } else {
    res.json({
      data: [],
    });
  }
}

/**
 * Read handler for reservation resources
 */
async function read(req, res) {
  res.status(200).json({
    data: res.locals.reservation,
  });
}

/**
 * Create handler for creating new reservations
 */
async function create(req, res) {
  const data = await service.create(res.locals.reservation);

  res.status(201).json({
    data: data[0],
  });
}

/**
 * Update handler for updating the status of a reservation
 */
async function updateStatus(req, res) {
  const { reservation_id } = req.params;
  const status = req.body.data.status;
  const data = await service.updateStatus(reservation_id, status);

  res.status(200).json({
    data: { status: data[0] },
  });
}

/**
 * Update handler for updating time, date, name, people of a reservation
 */
async function update(req, res) {
  const { reservation_id } = req.params;
  const data = await service.update(reservation_id, res.locals.reservation);
  res.status(200).json({
    data: data[0],
  });
}

/**reordered dateValidator and timelineValidator */

module.exports = {
  list: [asyncErrorBoundary(list)],
  read: [asyncErrorBoundary(checkId), asyncErrorBoundary(read)],
  create: [
    asyncErrorBoundary(validateNewReservation),
    asyncErrorBoundary(notTuesday),
    asyncErrorBoundary(dateValidator),
    asyncErrorBoundary(timelineValidator),
    asyncErrorBoundary(create),
  ],
  updateStatus: [
    asyncErrorBoundary(checkId),
    asyncErrorBoundary(validateStatusUpdate), 
    asyncErrorBoundary(updateStatus)
  ],
  update: [
    asyncErrorBoundary(checkId), 
    asyncErrorBoundary(validateUpdate), 
    asyncErrorBoundary(dateValidator), 
    asyncErrorBoundary(timelineValidator), 
    asyncErrorBoundary(update)]
};