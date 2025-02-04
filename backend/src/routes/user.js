
const { Router } = require('express');

const verify = require('../utils/verify');
const { getUserProfile, 
    updateUserProfile, 
    getFollowingUsers, 
    followUser, 
    unfollowUser
} = require('../engine/user');


const router = Router();


router.get('/get_profile', getUserProfile);
router.post('/update_profile', verify, updateUserProfile);

router.get('/get_followings', getFollowingUsers);
router.post('/follow', verify, followUser);
router.post('/unfollow', verify, unfollowUser);


module.exports = router;
