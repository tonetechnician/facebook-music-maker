/*
facebook-masheen

Extracts reactions from live stream video and converts to MIDI.

Author: Sean Devonport
*/
const https = require('https')
const EventSource = require('eventsource');
const midi = require('midi');
const easymidi = require('easymidi');

// Set facebook sharing and user access token
const link_fb_livestream = process.argv[2];
const user_access_token = process.argv[3];

let speed_param_counter;
let reaction_counts = {
  like : 0,
  love : 0,
  haha : 0,
  wow : 0,
  sad : 0,
  angry: 0
};

// MIDI Mapping parameters
let midi_param = {
  like : {type : 'note trigger', chan : 0, val : 20},
  love : {type : 'note trigger', chan : 1, val : 20},
  haha : {type : 'note trigger', chan : 2, val : 20},
  wow : {type : 'note trigger', chan : 3, val : 20},
  sad : {type : 'note trigger', chan : 4, val : 20},
  angry : {type : 'note trigger', chan : 5, val : 20},
  speed : 13 // 13 is 1.00 resolume video speed
}

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

// NewValue = (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
function scale(oldVal, oldMin=0, oldMax=100, newMin=0, newMax=127){
  // let oldRange = oldMax-oldMin;
  //let newRange = newMax-newMin;
  let oldRange = 100;
  let newRange = 127;
  let scaledVal = (oldVal * newRange)/oldRange;
  return scaledVal;
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

function trigger_control(chan,val=50,cc=0,){
  loop_output.send('cc',{
    controller : cc,
    value : val,
    channel : chan
  })
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
  let cc_value = comment.length%100;
  // Change the speed parameter and initialize interval
  midi_param.speed = Math.round(scale(cc_value));
  // trigger_control(10,50midi_param.speed);
  trigger_control(10,50,midi_param.speed);
  // Set the timer
  speed_param_counter = setInterval(check_control_speed,500);
};

// Enable the timer that performs step back to normal playback speed

// speed_param_counter = setInterval(check_control_speed,500);

function check_control_speed(){
  // console.log(midi_param.speed)
  if(midi_param.speed == 13){
    console.log("clearing timer")
    clearInterval(speed_param_counter);
  }
  else if(midi_param.speed > 13){
    // console.log("here")
    midi_param.speed--;
    trigger_control(10,midi_param.speed);
    // console.log(midi_param.speed)
  } else if (midi_param.speed < 13){
    midi_param.speed++;
    trigger_control(10,midi_param.speed);
    // console.log(midi_param.speed)
  }
}

// Closing app stuff
process.stdin.resume();//so the program will not close instantly

function exitHandler(options, exitCode) {
    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) {console.log("exitCode " + exitCode)};
    if (options.exit) {
      console.log("exiting app killing MIDI Port")
      loop_output.close();
      process.exit();
    }
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{exit:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));