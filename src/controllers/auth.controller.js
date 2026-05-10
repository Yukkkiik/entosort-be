const authService = require('../services/auth.service');
const { catchAsync } = require('../utils/catchAsync');

const login = catchAsync(async (req, res) => {
    const result = await authService.login(req.body);
    res.json({ success: true, message:'Login succesful', data: result});
});

const logout = catchAsync(async (req, res) => {
    // With stateless JWT, logout is handled client-side (delete token).
    // For token blacklisting, a Redis store can be added here.
    res.json({ success: true, message: 'Logout successful' });
});

module.exports = { login, logout };