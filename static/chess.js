// Access <body>, make sure the document has been loaded
const body = document.querySelector('body')


// Access the data atribute to retrieve gameId and orientation
const gameId = body.dataset.gameid 
const orientation = body.dataset.orientation

console.info(`gameId: ${gameId}, orientation: ${orientation}`)

// Handle onDrop
const onDrop = (src, dst, piece) => {
    console.info(`src=${src}, dst=${dst}, piece=${piece}`)

    // Construct the move
    const move = { src, dst, piece }

    // PATCH /chess/:gameId
    fetch(`/chess/${gameId}`, {
        method: 'PATCH',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(move)
    })
    .then(resp => console.info('RESPONSE: ', resp))
    .catch(err => console.error('ERROR: ', err))
}

// Create a chess configuration
const config = {
    draggable: true,
    position: 'start',
    orientation,
    onDrop
}

// Create an instance of chess
const chess = Chessboard('chess', config)

// Create a SSE connection
const sse = new EventSource('/chess/stream')
// Receive moves for gameId
sse.addEventListener(gameId, msg => {
    console.info('>>> SSE msg: ', msg)
    // const move = JSON.parse(msg.data)
    const { src, dst, piece } = JSON.parse(msg.data)
    console.info(`src: ${src}, dst: ${dst}, piece: ${piece}`)
    chess.move(`${src}-${dst}`)
})