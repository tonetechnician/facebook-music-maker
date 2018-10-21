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
console.log(outport.getPortName(5));
let output = new easymidi.Output('LoopBe Internal MIDI 5');

// Setup facebook live stream

let source_comments = new EventSource("https://streaming-graph.facebook.com/" + 
"743884185976561/" +
"live_comments"+
"?access_token="+
"EAAHRdX1xLl4BANbpxTF0gPIJXEufvkI2ykkW9P4QU41aRcQrLrRluYFZAHAZCZAg901wvsZCQcZB2m5PssVVhI8N5cGmo5ZAiRZBAGtGsuECytHPEp81CPgsdWYeWHpi53ln0XkJtIO0O0uKAutBcSWD642rteOHZBEsczhQlSSAZBZBdI6WWk0H7ELZAvOApmWtq9XMLSfCEgFKQZDZD"+
"&comment_rate=ten_per_second");

let source_reactions = new EventSource("https://streaming-graph.facebook.com/" + 
"743884185976561/" +
"live_reactions"+
"?access_token="+
"EAAHRdX1xLl4BANbpxTF0gPIJXEufvkI2ykkW9P4QU41aRcQrLrRluYFZAHAZCZAg901wvsZCQcZB2m5PssVVhI8N5cGmo5ZAiRZBAGtGsuECytHPEp81CPgsdWYeWHpi53ln0XkJtIO0O0uKAutBcSWD642rteOHZBEsczhQlSSAZBZBdI6WWk0H7ELZAvOApmWtq9XMLSfCEgFKQZDZD"+
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
  let trigger_event = "NA";
  // console.log(input)
  // console.log(reaction_counts)
  switch(input.key){
    case 'LIKE':
      // Check if values are the same, if not record that event must play
      if (input.value != reaction_counts.like){
        // console.log("in likes")
        // console.log("old: " + reaction_counts.like);
        reaction_counts.like = input.value;
        // console.log("new: " + reaction_counts.like);
        trigger_event = 'LIKE';
        console.log("got like")
        trigger_note(0);
      }
      break;
    case 'LOVE':
      if (input.value != reaction_counts.love){
        // console.log("in loves")
        // console.log("old: " + reaction_counts.love);
        reaction_counts.love = input.value;
        // console.log("new: " + reaction_counts.love);
        trigger_event = 'LOVE';
        console.log("got Love")
        trigger_note(1);
      }
      // trigger_note();
      break;
    case 'HAHA':
      if (input.value != reaction_counts.haha){
        reaction_counts.haha = input.value;
        trigger_event = 'HAHA';  
        console.log("got haha") 
        trigger_note(2);   
      }
      // trigger_note();
      break;
    case 'WOW':
      if (input.value != reaction_counts.wow){
        reaction_counts.wow = input.value;
        trigger_event = 'WOW';   
        console.log("got wow")     
        trigger_note(3);
      }
      // trigger_note();
      break;
    case 'SAD':
      if (input.value != reaction_counts.sad){
        reaction_counts.sad = input.value;
        trigger_event = 'SAD'; 
        console.log("got sad")  
        trigger_note(4);     
      }
      break;
    case 'ANGRY':
      if (input.value != reaction_counts.angry){
        // console.log("in angry")
        // console.log("old: " + reaction_counts.angry);
        // console.log("new val " + input.value)
        reaction_counts.angry = input.value;
        // console.log("new: " + reaction_counts.angry);
        // reaction_counts.angry = input.value;
        trigger_event = 'ANGRY'; 
        console.log("got angry")  
        trigger_note(5);     
      }
      // trigger_note();
      break;
    default:
      break;
  }
  return trigger_event;
}

source_reactions.onmessage = function(event) {
  // Do something with event.message for example
  // Send MIDI
  // console.log(event)
  let reaction = JSON.parse(event.data)
  // console.log(reaction)
  let trigger_event = "NA"
  // Parse reaction
  // console.log(reaction)
  console.log("reaction counts")
  console.log(reaction_counts)

  reaction.reaction_stream.map((x,i)=>{
    console.log(i)
    trigger_event = check_reaction(x)
  })
  console.log(reaction_counts)
};

source_comments.onmessage = function(event) {
  // Do something with event.message for example
  // Send MIDI
  // console.log(event.data)
  let data = event.data;
  console.log(data)
  // console.log(data)
  let comment = JSON.parse(data).message;
  console.log(comment)
  trigger_note(120,10);
};

