# facebook-music-maker

Basic nodeJS app that interacts with the facebook API to map live video reactions and comments to MIDI

It requires a [virtual MIDI driver](https://www.nerds.de/en/loopbe1.html) to interact with a DAW. 

## Installation

1. Install [LoopBe1](https://www.nerds.de/en/loopbe1.html)

2. Ensure you have the correct dependencies for [midi](https://www.npmjs.com/package/easymidi)

3. 
` 
npm install
`

## Run 

` 
node facebook-masheen.js <live-stream-id> <access-token>
`

for example

` 
node facebook-masheen.js 2094787547501243/ EAAHRdX1xLl4BAJ1UHNLaNyPXGSoUoVZAkgDMEAuMWAByQuN3pHP9nIZAG6owPN1VRa8iNslywi4r2aP6ZCGLPYUtkMZAF0EvjPMTd7A...
`