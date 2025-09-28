import axios from "axios"
import Movie from "../models/movie.js";
import Show from "../models/show.js";
//Api to get movies from tmdb api
const getNowPlayingMovies = async (req, res) => {
    try {
        const { data } = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
        })
        const movies = data.results;
        res.json({ success: true, movies: movies })
    } catch (error) {
        console.error('Error fetching now playing movies:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: error.message, details: error.response ? error.response.data : null })
    }
}
export default getNowPlayingMovies
//api to get new movie from database
export const addShow = async (req, res) => {
    try {
        const { movieId, showsInput, showPrice } = req.body;
        let movie = await Movie.findById(movieId);
        if (!movie) {
            //fetch movie details from tmdb
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
                }),
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
                })
            ])
            const movieApiData = movieDetailsResponse.data
            const movieCreditsData = movieCreditsResponse.data;

            const movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres: movieApiData.genres,
                casts: movieCreditsData.cast || [],
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime,
            }

            //add movie to the database
            movie = await Movie.create(movieDetails)

        }
        const showsToCreate = [];
        showsInput.forEach(show => {
            const showDate = show.date;
            show.time.forEach((time) => {
                const dateTimeString = `${showDate}T${time}`;
                showsToCreate.push({
                    movie: movieId,
                    showDateTime: new Date(dateTimeString),
                    showPrice,
                    occupiedSeats: {}
                })
            })
        });
        if (showsToCreate.length > 0) {
            await Show.insertMany(showsToCreate)
        }
        res.json({ success: true, message: 'Shows added Successfully' })
    } catch (error) {
        console.error('Error fetching now playing movies:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: error.message, details: error.response ? error.response.data : null })
    }
}

export const getShows = async (req, res) => {
    try {
        const activeMovieIds = await Show.distinct('movie', { showDateTime: { $gte: new Date() } })
        if (!activeMovieIds || activeMovieIds.length === 0) {
            return res.json({ success: true, shows: [] })
        }
        const movies = await Movie.find({ _id: { $in: activeMovieIds } })
        res.json({ success: true, shows: movies })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//api to get single show
export const getShow = async (req, res) => {
    try {
        const movieId = req.params.movieId;
        const shows = await Show.find({ movie: movieId, showDateTime: { $gte: new Date() } }).sort({ showDateTime: 1 });
        const movie = await Movie.findById(movieId)

        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' })
        }

        const dateTime = {};
        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split("T")[0];
            if (!dateTime[date]) {
                dateTime[date] = []
            }
            dateTime[date].push({ time: show.showDateTime, showId: show._id })
        })
        res.json({ success: true, movie, dateTime })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}