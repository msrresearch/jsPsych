/* jspsych-text.js
 * Josh de Leeuw
 *
 * This plugin displays text (including HTML formatted strings) during the experiment.
 * Use it to show instructions, provide performance feedback, etc...
 *
 * documentation: docs.jspsych.org
 *
 *
 */

jsPsych.plugins["text-stim"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'text-stim',
    description: '',
    parameters: {
      text: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: undefined,
        no_function: false,
        description: ''
      },
      choices: {
        type: [jsPsych.plugins.parameterType.KEYCODE, jsPsych.plugins.parameterType.SELECT],
        options: ['mouse'],
        array: true,
        default: undefined,
        no_function: false,
        description: ''
      },
      timing_response: {
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
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    trial.choices = trial.choices || jsPsych.ALL_KEYS;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // set the HTML of the display target to replaced_text.
    display_element.innerHTML = trial.text;
    trial.response_ends_trial = (typeof trial.response_ends_trial == 'undefined') ? true : trial.response_ends_trial;
    trial.timing_response = trial.timing_response || -1;
    
    var response = {
      rt: -1,
      key: -1
    };
    
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
        "key_press": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    var after_response = function(info) {

      // only record the first response
      if (response.key == -1) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }

    };

    var mouse_listener = function(e) {

      var rt = (new Date()).getTime() - start_time;

      display_element.removeEventListener('click', mouse_listener);

      var response = {
        key: 'mouse',
        rt: rt
      };

    };

    // check if key is 'mouse'
    if (trial.choices == 'mouse') {
      display_element.addEventListener(mouse_listener);
      var start_time = (new Date()).getTime();
    } else {
      jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }
    
        // end trial if timing_response is set
    if (trial.timing_response > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.timing_response);
    }

  };

  return plugin;
})();
