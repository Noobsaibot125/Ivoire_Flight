const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./src/config/db');
const { syncDB } = require('./src/models');

const app = express();
const PORT = process.env.PORT || 5000;

/* ────────────────────────────────────────────────────────────────
   Gestionnaires d'erreurs globaux  ← empêchent le process de mourir
──────────────────────────────────────────────────────────────── */
process.on('uncaughtException', (err) => {
    console.error('⚠️  [uncaughtException]', err.message);
    console.error(err.stack);
    // On NE quitte PAS – on garde le serveur vivant
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️  [unhandledRejection]', reason);
    // On NE quitte PAS – on garde le serveur vivant
});

/* ────────────────────────────────────────────────────────────────
   Connexion base de données (correctement chaînée)
──────────────────────────────────────────────────────────────── */
(async () => {
    try {
        await connectDB();
        await syncDB();
    } catch (err) {
        console.error('❌ Erreur DB au démarrage:', err.message);
        // On continue quand même – certaines routes n'ont pas besoin de la DB
    }
})();

/* ────────────────────────────────────────────────────────────────
   Middlewares
──────────────────────────────────────────────────────────────── */
app.use(helmet());
app.use(cors({
    origin: true,        // Accepte toutes les origines en développement
    credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

/* ────────────────────────────────────────────────────────────────
   Rate Limiting global
──────────────────────────────────────────────────────────────── */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);

/* ────────────────────────────────────────────────────────────────
   Routes
──────────────────────────────────────────────────────────────── */
app.use('/api/auth',      require('./src/routes/auth.routes'));
app.use('/api/dashboard', require('./src/routes/dashboard.routes'));
app.use('/api/flights',   require('./src/routes/flight.routes'));

// Health-check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'IvoireFlights API is running ✅', port: PORT });
});

/* ────────────────────────────────────────────────────────────────
   Gestionnaire d'erreurs Express (middleware 4 paramètres)
──────────────────────────────────────────────────────────────── */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('❌ [ExpressError]', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Une erreur interne du serveur est survenue.',
    });
});

/* ────────────────────────────────────────────────────────────────
   Démarrage du serveur
──────────────────────────────────────────────────────────────── */
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`   → http://localhost:${PORT}\n`);
});
