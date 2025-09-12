// server/controllers/currencyController.js

import asyncHandler from '../middleware/asyncHandler.js';
import axios from 'axios';

// @desc    Get latest currency conversion rates against USD
// @route   GET /api/currency/rates
// @access  Public
const getConversionRates = asyncHandler(async (req, res) => {
    // ... This function is correct and does not need changes ...
    try {
        const apiKey = process.env.EXCHANGE_RATE_API_KEY;
        if (!apiKey) {
            throw new Error('Exchange rate API key is not configured.');
        }

        const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
        
        if (response.data && response.data.result === 'success') {
            const rates = response.data.conversion_rates;
            
            const relevantRates = {
                USD: rates.USD, EUR: rates.EUR, GBP: rates.GBP, CAD: rates.CAD,
                XAF: rates.XAF, XOF: rates.XOF, NGN: rates.NGN, GHS: rates.GHS, 
                KES: rates.KES, ZAR: rates.ZAR, ZWL: rates.ZWL,
            };
            res.json(relevantRates);
        } else {
            throw new Error('Failed to fetch conversion rates from external API.');
        }
    } catch (error) {
        console.error("Currency conversion error:", error.message);
        res.status(500).json({ message: "Could not fetch currency rates." });
    }
});

// @desc    Get user's geolocation based on their IP address
// @route   GET /api/currency/geolocate
// @access  Public
const geolocate = asyncHandler(async (req, res) => {
    try {
        let apiUrl = 'https://ipapi.co/json/';

        // --- THIS IS THE FIX ---
        // Get the user's IP address. In production (e.g., on Render), 
        // the 'x-forwarded-for' header will contain the real user IP.
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Check if the IP is a standard loopback address (for local development).
        // If it's not a loopback IP, it's a real IP that we can look up.
        if (ip && ip !== '::1' && ip !== '127.0.0.1') {
            apiUrl = `https://ipapi.co/${ip}/json/`;
        }
        // If it IS a loopback address, we just call the API without an IP.
        // The API will then use the IP of the server making the request.

        const { data } = await axios.get(apiUrl);

        res.json({
            country: data.country_code,
            currency: data.currency
        });
    } catch (error) {
        console.warn("Server-side geolocation via ipapi.co failed:", error.message);
        // If it fails, send a safe default fallback.
        res.status(500).json({ country: 'US', currency: 'USD' });
    }
});


export { getConversionRates, geolocate };