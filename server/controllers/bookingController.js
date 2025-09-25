//function to check available seats

import Booking from "../models/Bookings.js";
import Show from "../models/Show.js"
import stripe from 'stripe'

const checkSeatsAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId)
        if (!showData) {
            return false;
        }
        const occupiedSeats = showData.occupiedSeats || {}
        const isAnySeatTaken = selectedSeats.some(seat => {
            return occupiedSeats[seat] === true
        })
        return !isAnySeatTaken;

    } catch (error) {
        console.log(error.message)
        return false;
    }
}

export const createBooking = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { showId, selectedSeats } = req.body
        const { origin } = req.headers;

        //check if the seat is available or not
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats)
        if (!isAvailable) {
            return res.json({ success: false, message: "Selected Seats are not available." })
        }

        //get the show details
        const showData = await Show.findById(showId).populate('movie');
        //create a new booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats
        })
        selectedSeats.forEach((seat) => {
            showData.occupiedSeats[seat] = true
        })
        showData.markModified('occupiedSeats')
        await showData.save()

        //payment gateway stripe
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
        //creating line items
        const line_items = [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: showData.movie.title
                },
                unit_amount: Math.floor(booking.amount) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString()
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60//expires in 30 mins
        })

        booking.paymentLink = session.url
        await booking.save()  // Fixed: booking.save() not Booking.save()

        res.json({ success: true, url: session.url })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: 'booking unsuccessful' })
    }
}

export const getOccupiedSeats = async (req, res) => {
    try {
        const { id } = req.params;
        const showData = await Show.findById(id)
        if (!showData) {
            return res.json({ success: false, message: 'Show not found' })
        }
        const occupiedSeats = Object.keys(showData.occupiedSeats || {}).filter(seat => showData.occupiedSeats[seat] === true)
        res.json({ success: true, occupiedSeats, message: 'Occupied Seats' })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: 'booking unsuccessful' })
    }
}