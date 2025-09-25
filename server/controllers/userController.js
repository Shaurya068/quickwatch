import { clerkClient } from "@clerk/express"
import Booking from "../models/Bookings.js"
import Movie from "../models/movie.js"

//api controller to get user
export const getUserBookings = async (req, res) => {
    try {
        const user = req.auth().userId
        const bookings = await Booking.find({ user }).populate({
            path: "show",
            populate: { path: "movie" }
        }).sort({ createdAt: -1 })
        res.json({ success: true, bookings })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })

    }
}
//api to update favourite movie in clerk useer data
export const updateFavourite = async (req, res) => {
    try {
        const { movieId } = req.body
        const userId = req.auth().userId
        const user = await clerkClient.users.getUser(userId)

        if (!user.privateMetadata.favorites) {
            user.privateMetadata.favorites = []
        }
        if (!user.privateMetadata.favorites.includes(movieId)) {
            user.privateMetadata.favorites.push(movieId)
        } else {
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter(item => item !== movieId)
        }

        await clerkClient.users.updateUserMetadata(userId, { privateMetadata: user.privateMetadata })
        res.json({ success: true, message: "favourite updated successfully" })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}

export const getFavourites = async (req, res) => {
    try {
        const user = await clerkClient.users.getUser(req.auth().userId)
        const favoriteIds = user.privateMetadata.favorites || []

        //get movies from database
        const movies = await Movie.find({ _id: { $in: favoriteIds } })
        res.json({ success: true, movies })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}