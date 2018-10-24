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

// Setup MIDI port
console.log("AVAILABLE MIDI PORTS:");
let available_outputs = easymidi.getOutputs();
console.log(available_outputs)
let loop_output;
// let loop_output = new easymidi.Output('LoopBe Internal MIDI 5');
try{
  loop_output = new easymidi.Output(
    available_outputs.filter(x=>x.startsWith("LoopBe"))
  );
} catch (e){
  loop_output = undefined;
  console.log("No LoopBe Found. \nPlease install LoopBe then try again")
}

function trigger_note(chan,note=20){
  loop_output.send('noteon', {
    note: note,
    velocity: 127,
    channel: chan
  });
  
  setTimeout(x=>{
    loop_output.send('noteoff', {
      note: note,
      velocity: 127,
      channel: chan
    });
  }, 20)
}

function check_reaction(input){
  /* Currently the note is triggered as new reaction is received. 
  This Could probably be changed.
  It does not account for when multiple reactions are received.
  i.e One note will play if reaction count goes from 1 - 5. This could be changed quite
  easily    */
  let trigger_events = [];

  switch(input.key){
    case 'LIKE':
      // Check if values are the same, if not record the event must play
      if (input.value != reaction_counts.like){
        reaction_counts.like = input.value;
        trigger_events.push('LIKE');

        console.log("got like")
        trigger_note(0);
      }
      break;
    case 'LOVE':
      if (input.value != reaction_counts.love){
        reaction_counts.love = input.value;
        trigger_events.push('LOVE');

        console.log("got Love")
        trigger_note(1);
      }
      break;
    case 'HAHA':
      if (input.value != reaction_counts.haha){
        reaction_counts.haha = input.value;

        trigger_events.push('HAHA'); 
        console.log("got haha") 
        trigger_note(2);   
      }
      break;
    case 'WOW':
      if (input.value != reaction_counts.wow){
        reaction_counts.wow = input.value;

        trigger_events.push('WOW');
        console.log("got wow")     
        trigger_note(3);
      }
      break;
    case 'SAD':
      if (input.value != reaction_counts.sad){
        reaction_counts.sad = input.value;

        trigger_events.push('SAD');
        console.log("got sad")  
        trigger_note(4);     
      }
      break;
    case 'ANGRY':
      if (input.value != reaction_counts.angry){
        reaction_counts.angry = input.value;

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

// FB streaming stuff
let reaction_counts = {
  like : 0,
  love : 0,
  haha : 0,
  wow : 0,
  sad : 0,
  angry: 0
};

// Setup facebook live stream
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

source_reactions.onmessage = function(event) {
  // Send MIDI on receiving reaction message
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
  trigger_note(10); // Currently just triggers note on MIDI channel 10
};

