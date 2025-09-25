import express from 'express'
import { createBooking, getOccupiedSeats } from '../controllers/bookingController.js'


const bookingRouter = express.Router();
bookingRouter.post('/create', createBooking)
bookingRouter.get('/seats/:id', getOccupiedSeats)


export default bookingRouter;
