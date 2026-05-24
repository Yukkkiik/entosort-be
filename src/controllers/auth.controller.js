const authService = require('../services/auth.service');
const { catchAsync } = require('../utils/catchAsync');

const login = catchAsync(async (req, res) => {
    const result = await authService.login(req.body);
``
    res.cookie('token', result.token, {
        httpOnly: true,
        secure: false,  
        sameSite: 'lax',     
        maxAge: 60 * 60 * 1000, 
    });

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: result.user, 
        },
    });
});

const logout = catchAsync(async (req, res) => {
    res.clearCookie('token', {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
    });
    res.json({ success: true, message: 'Logout successful' });
});

module.exports = { login, logout };