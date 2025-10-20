import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { responseHandler } from './api/middleware/index.js'
import errorHandler from './api/middleware/errorHandler.js'
import routes from './api/routes/index.js'
import "./api/cron/rent-reminder/rentReminder.js"
import { loggerMiddleware } from './api/helper/logger.js'
import CustomError from './api/helper/customError.js'
import { swaggerDocs } from './swagger.js'

dotenv.config()
const app = express()

app.use(loggerMiddleware)

// ---------- SECURITY MIDDLEWARE ----------
app.use(helmet()) // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// ---------- GENERAL MIDDLEWARE ----------
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(morgan('dev'))

// ---------- SWAGGER DOCS ----------
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  explorer: true,
  customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-material.css'
}))



// ---------- ROUTES ----------
app.use(responseHandler)

app.use('/api', routes)

app.use(errorHandler)


// ---------- ERROR HANDLERS ----------

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new CustomError('API endpoint not found', 404);
  next(error);
});

// Global error handler
app.use((err, req, res, next) => {
  // Log error
  console.error(err);

  // Set locals, only providing error in development
  const errorResponse = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    errorResponse.status = 400;
    errorResponse.message = Object.values(err.errors).map(val => val.message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    errorResponse.status = 400;
    errorResponse.message = 'Duplicate key error';
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    errorResponse.status = 401;
    errorResponse.message = 'Invalid token';
  }

  res.status(errorResponse.status).json({
    success: false,
    error: errorResponse
  });
});

app.use('/', (req, res, next) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Animated Login Form</title>

        <style>
        body {
          margin: 0
          height: 100vh
          display: flex
          justify-content: center
          align-items: center
          background: #f0f0f0
        }

        div{
            height: 200px
        }
      </style>

    </head>
    <body>

    <!-- you will get embadding code like this -->
    <div class="visme_d" 
        data-title="Webinar Registration Form" 
        data-url="g7ddqxx0-untitled-project?
        fullPage=true" 
        data-domain="forms" 
        data-full-page="true" 
        data-min-height="100vh" 
        >
    </div>

    <script src="https://static-bundles.visme.co/forms/vismeforms-embed.js"></script>

    </body>
    </html>
  `)
})




// ---------- CONNECT TO DB & START SERVER ----------
const PORT = process.env.PORT || 8080
const MONGO_URI = process.env.MONGO_URI

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })
