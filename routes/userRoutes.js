const express = require("express");
const {
  updateUserProfile,
  deleteAccount,
  userSearch,
  deleteProfilePhoto,
  getProfile,
  follow,
  unfollow,
  getFollowers,
  getFollowing,
  postOpenai

} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.put("/profile/:userId", protect, updateUserProfile);
router.post("/deleteacc/:userId", protect, deleteAccount);
router.delete("/profilephoto/delete",protect,deleteProfilePhoto);
router.get("/search", protect, userSearch);
router.post("/follow/:userId",protect,follow);
router.post("/unfollow/:userId",protect,unfollow);
router.get("/profile",protect,getProfile);
router.get("/followers/:userId",protect,getFollowers);
router.get("/following/:userId",protect,getFollowing);
router.post("/generate-response",protect,postOpenai)


module.exports = router;
