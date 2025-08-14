import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { responseHandler } from './api/middleware/index.js'
import errorHandler from './api/middleware/errorHandler.js'
import routes from './api/routes/index.js'
import "./api/cron/rent-reminder/rentReminder.js"; // Start cron jobs


dotenv.config()
const app = express()

// ---------- MIDDLEWARE ----------
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))



// ---------- ROUTES ----------
app.use(responseHandler)

app.use('/api', routes)

app.use(errorHandler)



// ---------- 404 HANDLER ----------
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' })
})

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
