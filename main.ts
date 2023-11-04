// Import the packages
import express from 'express'
import morgan from 'morgan'
import { engine } from 'express-handlebars'
import { v4 } from 'uuid'
import { EventSource } from 'express-ts-sse'

// Default to 3000 if PORT env is not set
const port = process.env.PORT || 3000;

// Create an instance of SSE
const sse = new EventSource()

// Create an instance  of the application
const app = express()

// Configure render
app.engine('html', engine({ defaultLayout: false }))
app.set('view engine', 'html')

// Log incoming request
app.use(morgan('combined'))

// POST /chess
app.post('/chess', express.urlencoded({ extended: true }),
(req, resp) => {
    const gameId = v4().substring(0, 8)
    const orientation = 'white'

    resp.status(200).render('chess', { gameId, orientation })
})

// GET /chess?gameId=abc123
app.get('/chess',
(req, resp) => {
    const gameId = req.query.gameId
    const orientation = 'black'
    resp.status(200).render('chess', { gameId, orientation })
})

// PATCH /chess/:gameId
app.patch('/chess/:gameId', express.json(),
(req, resp) => {
    // Get the gameId from the resource
    const gameId = req.params.gameId
    const move = req.body

    console.info(`GameId: ${gameId}: `, move)
    // Should stringfy the data
    // sse.send({ event: gameId, JSON.stringfy(data) })
    sse.send({ event: gameId, data: move })

    resp.status(201).json({ timestamp: (new Date()).getTime() })
})

// GET /chess/stream
app.get('/chess/stream', sse.init)

// Serve files from static
app.use(express.static(__dirname + '/static'))

// Start express
app.listen(port, () => {
    console.info(`Application bound to port ${port} at ${new Date()}`)
})
