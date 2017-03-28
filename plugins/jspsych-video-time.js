/* jspsych-video.js
 * Josh de Leeuw
 *
 * This plugin displays a video. The trial ends when the video finishes.
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins["video-time"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'video-time',
    description: '',
    parameters: {
      sources: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: true,
        default: undefined,
        no_function: false,
        description: ''
      },
      width: {
        type: [jsPsych.plugins.parameterType.INT],
        default: undefined,
        no_function: false,
        description: ''
      },
      height: {
        type: [jsPsych.plugins.parameterType.INT],
        default: undefined,
        no_function: false,
        description: ''
      },
      autoplay: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: true,
        no_function: false,
        description: ''
      },
      controls: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      prompt: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      },
      choices: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        array: true,
        default: jsPsych.ALL_KEYS,
        no_function: false,
        description: ''
      },
      respond_after: {
        type: [jsPsych.plugins.parameterType.INT],
        default: -1,
        no_function: false,
        description: ''
      },
      response_ends_trial: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: true,
        no_function: false,
        description: ''
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    // set default values for the parameters
    trial.prompt = trial.prompt || "";
    trial.autoplay = typeof trial.autoplay == 'undefined' ? true : trial.autoplay;
    trial.controls = typeof trial.controls == 'undefined' ? false : trial.controls;
    trial.choices = trial.choices || jsPsych.ALL_KEYS;
    trial.response_ends_trial = (typeof trial.response_ends_trial == 'undefined') ? true : trial.response_ends_trial;
    trial.respond_after = trial.respond_after || -1;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
    
    
        // store response
    var response = {
      rt: -1,
      key: -1
    };
    
            // function to handle responses by the subject
    var after_response = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      //display_element.querySelector('#jspsych-animation-image').className += ' responded';

      response = {
        key: info.key,
        rt: info.rt,
      };

	  // 2250ms is the time according to schillbach after which answering is possible
      if (trial.response_ends_trial && (response.rt > trial.respond_after)) {
        end_trial();
      }
    };
    
            // start the response listener
    if (trial.choices != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'date',
        persist: true,
        allow_held_key: false
      });
    }
 

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.sources,
        "key_press": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // display stimulus
    var video_html = '<video id="jspsych-video-player" width="'+trial.width+'" height="'+trial.height+'" '
    if(trial.autoplay){
      video_html += "autoplay "
    }
    if(trial.controls){
      video_html +="controls "
    }
    video_html+=">"
    for(var i=0; i<trial.sources.length; i++){
      var s = trial.sources[i];
      var type = s.substr(s.lastIndexOf('.') + 1);
      type = type.toLowerCase();
      video_html+='<source src="'+s+'" type="video/'+type+'">';
    }
    video_html +="</video>"

    display_element.innerHTML += video_html;

    //show prompt if there is one
    if (trial.prompt !== "") {
      display_element.innerHTML += trial.prompt;
    }

    display_element.querySelector('#jspsych-video-player').onended = function(){
      end_trial();
    }
    

    //// end trial if time limit is set
    //if (trial.timing_response > 0) {
      //jsPsych.pluginAPI.setTimeout(function() {
        //end_trial();
      //}, trial.timing_response);
    //}

  };

  return plugin;
})();
