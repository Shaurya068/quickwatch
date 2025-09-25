import Booking from "../models/Bookings.js"
import Show from "../models/Show.js"
import User from "../models/User.js"
import { clerkClient } from "@clerk/express"

export const isAdmin = async (req, res) => {
    try {
        const userId = req.auth.userId


        if (!userId) {

            return res.json({ success: false, isAdmin: false, message: "User not authenticated" })
        }

        const user = await clerkClient.users.getUser(userId)
        console.log('Controller - User metadata:', user.privateMetadata)

        const isAdminUser = user.privateMetadata?.role === 'admin'
        console.log('Controller - Is admin user:', isAdminUser)

        res.json({
            success: true,
            isAdmin: isAdminUser,

        })
    } catch (error) {
        console.error('Error checking admin status:', error)
        res.json({ success: false, isAdmin: false, message: "Authentication error" })
    }
}

//api to get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const bookings = await Booking.find({ isPaid: true })
        const activeShows = await Show.find({ showDateTime: { $gt: new Date() } }).populate('movie')
        const totalUser = await User.countDocuments()

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
            activeShows,
            totalUser
        }

        res.json({ success: true, dashboardData })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}

//api to get all shows
export const getAllShows = async (req, res) => {
    try {
        const shows = await Show.find({ showDateTime: { $gt: new Date() } }).populate('movie').sort({ showDateTime: 1 })
        res.json({ success: true, shows })

    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}


//api to get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate('user').populate({
            path: "show",
            populate: { path: 'movie' }
        }).sort({ createdAt: -1 })
        res.json({ success: true, bookings })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}