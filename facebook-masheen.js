/*
facebook-masheen

Extracts reactions from live stream video and converts to MIDI.

Author: Sean Devonport
*/
const https = require('https')
const EventSource = require('eventsource');
const midi = require('midi');
const easymidi = require('easymidi');
const readline = require('readline');

// Set facebook sharing and user access token
const link_fb_livestream = process.argv[2];
const user_access_token = process.argv[3];
// console.log(link_fb_livestream)

// FB streaming stuff
// let link_fb_livestream;
// let user_access_token;
let reaction_counts = {
  like : 0,
  love : 0,
  haha : 0,
  wow : 0,
  sad : 0,
  angry: 0
};

// console.log(reaction_counts.like)
let outport = new midi.output();
// List port names:
console.log("AVAILABLE MIDI PORTS:");
for (let i=0;i<output.getPortCount();i++){
  console.log(i+ ": " + outport.getPortName(i));
}

let output = new easymidi.Output('LoopBe Internal MIDI 1');

// Setup facebook live stream

// let source_comments = new EventSource("https://streaming-graph.facebook.com/" + 
// "743884185976561/" +
// "live_comments"+
// "?access_token="+
// "EAAHRdX1xLl4BANbpxTF0gPIJXEufvkI2ykkW9P4QU41aRcQrLrRluYFZAHAZCZAg901wvsZCQcZB2m5PssVVhI8N5cGmo5ZAiRZBAGtGsuECytHPEp81CPgsdWYeWHpi53ln0XkJtIO0O0uKAutBcSWD642rteOHZBEsczhQlSSAZBZBdI6WWk0H7ELZAvOApmWtq9XMLSfCEgFKQZDZD"+
// "&comment_rate=ten_per_second");

let source_comments = new EventSource("https://streaming-graph.facebook.com/" + 
link_fb_livestream +
"live_comments"+
"?access_token="+
user_access_token +
"&comment_rate=ten_per_second");

let source_reactions = new EventSource("https://streaming-graph.facebook.com/" + 
link_fb_livestream +
"live_reactions"+
"?access_token="+
user_access_token+
"&comment_rate=ten_per_second");

function trigger_note(chan,note=20){
  output.send('noteon', {
    note: note,
    velocity: 127,
    channel: chan
  });
  
  setTimeout(x=>{
    output.send('noteoff', {
      note: note,
      velocity: 127,
      channel: chan
    });
  }, 20)
}

function check_reaction(input){
  let trigger_events = [];

  switch(input.key){
    case 'LIKE':
      // Check if values are the same, if not record that event must play
      if (input.value != reaction_counts.like){
        reaction_counts.like = input.value;
        trigger_events.push('LIKE');
        // trigger_event = 'LIKE';
        console.log("got like")
        trigger_note(0);
      }
      break;
    case 'LOVE':
      if (input.value != reaction_counts.love){
        reaction_counts.love = input.value;
        trigger_events.push('LOVE');
        // trigger_event = 'LOVE';
        console.log("got Love")
        trigger_note(1);
      }
      break;
    case 'HAHA':
      if (input.value != reaction_counts.haha){
        reaction_counts.haha = input.value;
        // trigger_event = 'HAHA'; 
        trigger_events.push('HAHA'); 
        console.log("got haha") 
        trigger_note(2);   
      }
      break;
    case 'WOW':
      if (input.value != reaction_counts.wow){
        reaction_counts.wow = input.value;
        // trigger_event = 'WOW';   
        trigger_events.push('WOW');
        console.log("got wow")     
        trigger_note(3);
      }
      break;
    case 'SAD':
      if (input.value != reaction_counts.sad){
        reaction_counts.sad = input.value;
        // trigger_event = 'SAD'; 
        trigger_events.push('SAD');
        console.log("got sad")  
        trigger_note(4);     
      }
      break;
    case 'ANGRY':
      if (input.value != reaction_counts.angry){
        reaction_counts.angry = input.value;
        // trigger_event = 'ANGRY';
        trigger_events.push('ANGRY'); 
        console.log("got angry")  
        trigger_note(5);     
      }
      break;
    default:
      break;
  }
  return trigger_events;
}

source_reactions.onmessage = function(event) {
  // Send MIDI on receiving reaction message
  // console.log(event)
  let reaction = JSON.parse(event.data)

  let trigger_events = [];
  // Parse reaction
  reaction.reaction_stream.map((x,i)=>{
    trigger_events = check_reaction(x)
  })
};

source_comments.onmessage = function(event) {
  // Send MIDI on receiving comment message  
  let comment = JSON.parse(event.data).message;
  console.log(comment)
  trigger_note(120,10);
};

