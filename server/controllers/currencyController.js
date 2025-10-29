// server/controllers/currencyController.js

import axios from 'axios';

// --- Simple In-Memory Cache Setup ---
// The 'Map' object will store our cached results.
const geoCache = new Map();
// Set the cache duration. 1 hour (in milliseconds) is a good value.
const CACHE_TTL = 1000 * 60 * 60; // 1 hour = 60 minutes * 60 seconds * 1000 milliseconds

// @desc    Get latest currency conversion rates against USD
// @route   GET /api/currency/rates
// @access  Public
const getConversionRates = async (req, res, next) => {
    try {
        const apiKey = process.env.EXCHANGE_RATE_API_KEY;
        if (!apiKey) {
            console.error('ExchangeRate-API key is missing from .env');
            // Using return here to stop execution and send a clear server-side error
            return res.status(500).json({ message: "Currency service is not configured." });
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
            throw new Error('Failed to fetch conversion rates from external service.');
        }
    } catch (error) {
        console.error("Currency conversion error:", error.message);
        // Pass any caught error to the global error handler
        next(error); 
    }
};

// @desc    Get user's geolocation based on their IP address (with caching)
// @route   GET /api/currency/geolocate
// @access  Public
const geolocate = async (req, res, next) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        // --- 1. Check if a valid result is in our cache ---
        if (geoCache.has(ip)) {
            const cachedData = geoCache.get(ip);
            // Check if the cached data is still "fresh" (not expired)
            if (Date.now() - cachedData.timestamp < CACHE_TTL) {
                console.log(`[Cache HIT] Serving geolocation for IP ${ip} from cache.`);
                // If it's fresh, return the cached data and stop execution.
                return res.json(cachedData.data);
            }
        }

        // --- 2. If not in cache or expired, fetch from the external API ---
        console.log(`[Cache MISS] Fetching new geolocation for IP ${ip} from ipapi.co`);
        let apiUrl = 'https://ipapi.co/json/';
        if (ip && ip !== '::1' && ip !== '127.0.0.1') {
            apiUrl = `https://ipapi.co/${ip}/json/`;
        }

        const { data } = await axios.get(apiUrl, { timeout: 5000 });

        if (!data || !data.country_code || !data.currency) {
            throw new Error('Invalid response received from geolocation service.');
        }

        const locationData = {
            country: data.country_code,
            currency: data.currency
        };

        // --- 3. Store the new result in the cache with a current timestamp ---
        geoCache.set(ip, {
            data: locationData,
            timestamp: Date.now()
        });

        // Send the fresh data to the client
        res.json(locationData);

    } catch (error) {
        console.warn("Server-side geolocation via ipapi.co failed:", error.message);
        const serviceError = new Error('The external geolocation service is currently unavailable.');
        // Pass the error to the global error handler
        next(serviceError);
    }
};

export { getConversionRates, geolocate };