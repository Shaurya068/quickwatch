import { clerkClient } from "@clerk/express";
export const protectAdmin = async (req, res, next) => {
    try {
        const userId = req.auth.userId


        if (!userId) {

            return res.json({ success: false, message: "User not authenticated" })
        }

        const user = await clerkClient.users.getUser(userId)


        if (user.privateMetadata.role !== 'admin') {

            return res.json({ success: false, message: "not authorised" })
        }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error)
        return res.json({ success: false, message: "Authentication error" })
    }
}
