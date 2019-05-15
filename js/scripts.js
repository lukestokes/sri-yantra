var default_config = {
    'meditation_time_seconds':600,
    'empty_space_time_seconds':30,
    'meditating':0,
    'meditation_progress':0,
    'progress_bar_timer':null,
    'learning':0,
    'level':-1,
    'database':[],
    'entries': []
};
var config = {};

var nanobar = new Nanobar();

$( document ).ready(function() {
    resetConfig();

    if (/Mobi|Android/i.test(navigator.userAgent)) {
        alert("The Sri Yantra Tool is currently only available for desktop computers.");
    }

    $('.paths').css('cursor', 'pointer');

    $(".paths").mouseover(function(){
        var level = getLevel(this.id);
        var description = getDescription(this.id);
        var show_change = 1;
        if (config.meditating == 1) {
            show_change = false;
        }
        if (config.learning == 1) {
            show_change = false;
            if (level == config.level) {
                show_change = true;
            }
        }
        updateDescription(description, level);
        var color = getColor(level);
        if (show_change) {
            $("#"+this.id).css({'fill': color});
            if (level == 0) {
                $("#a_"+this.id).css({'fill': color});
                $("#c_"+this.id).css({'fill': color});
            }            
        }
    }); 
    $(".paths").mouseout(function(){
        resetColor(this.id);
        var level = getLevel(this.id);
        var description = '';
        if (config.learning == 1 && config.entries.length) {
            description = config.entries[0].description;
        }
        updateDescription(description, level);
    }); 
    $(".paths").click(function(){
        if (config.learning == 1) {
            description = getDescription(this.id);
            if (config.entries.length && config.entries[0].description == formatDescription(description)) {
                updateLog(formatDescription(description));
                config.entries.shift();
                if (config.entries.length == 0) {
                    config.level++;
                    updateLevel();
                    updateLog("<strong>=== Reached Level " + (config.level+1) + " ===</strong>");
                    if (config.level == 10) {
                        resetEverything();
                        alert("Congratulations!");
                        return false;
                    }
                    getRandomEntries();
                }
                updateDescription(config.entries[0].description,config.level);
            }
        }
        return false;
    }); 
    $("#begin_meditation").click(function(){
        hideMenu();
        beginMeditation();
        return false;
    });
    $("#explore_sri_yantra").click(function(){
        config.learning = 0;
        hideMenu();
        showSriYantra("right");
        return false;
    });
    $("#learn_sri_yantra").click(function(){
        config.learning = 1;
        hideMenu();
        showSriYantra("right");
        getRandomEntries();
        updateDescription(config.entries[0].description,config.level);
        updateLevel();
        return false;
    });
    $("#return_menu").click(function(){
        resetEverything();
        return false;
    });
});


function getLevel(text) {
    var level = text.substring('level_'.length,'level_'.length+1);
    return level;
}
function getDescription(text) {
    var description = text.substring('level_'.length+2);
    return description;
}

function getColor(level) {
    var color = "#ff0000";
    switch(level) {
      case "0":
        color = "#5d2adb";
        break;
      case "1":
        color = "#ffff00";
        break;
      case "2":
        color = "#ff00ff";
        break;
      case "3":
        color = "#0400ff";
        break;
      case "4":
        color = "#00ffff";
        break;
      case "5":
        color = "#ff7700";
        break;
      case "6":
        color = "#008080";
        break;
      case "7":
        color = "#800400";
        break;
      case "8":
        color = "#800080";
        break;
      case "9":
        color = "#FF0000";
        break;
      default:
    }
    return color;
}

function resetConfig() {
    config = JSON.parse(JSON.stringify(default_config));
    updateDatabase();
}

function resetColor(id) {
    var color = "#000000";
    var level = getLevel(id);
    if (id == "level_1_present" || id == "level_9_bindu") {
        color = "#FFFFFF";
    }
    var swap_back = true;
    if (config.learning == 1) {
        var in_entries = false;
        for (var i = 0; i < config.entries.length; i++) {
            if (config.entries[i].id == id) {
                in_entries = true;
            }
        }
        if (!in_entries) {
            swap_back = false;
        }
    }
    if (swap_back) {
        $("#"+id).css({'fill': color});
        if (level == 0) {
            $("#a_"+id).css({'fill': '#000000'});
            $("#c_"+id).css({'fill': '#000000'});
        }
    }
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function updateDatabase() {
    for (var i = $(".paths").length - 1; i >= 0; i--) {
        id = $(".paths")[i].id;
        level = getLevel(id);
        if (!(level in config.database)) {
            config.database[level] = [];
        }
        var entry = {"id":id, "description":formatDescription(getDescription(id))};
        // skip duplicates
        var already_exists = false;
        for (var j = 0; j < config.database[level].length; j++) {
            if (config.database[level][j].id == id) {
                already_exists = true;
            }
        }
        if (!already_exists) {
            config.database[level][config.database[level].length] = entry;
        }
    }
}

function getRandomEntries() {
    if (config.level == -1) {
        config.level++;
    }
    var entries = [...config.database[config.level]];
    shuffleArray(entries);
    config.entries = [...entries];
}

function updateLevel() {
    var level_text = "Level: " + (config.level+1);
    $("#level").html(level_text);
}
function updateLog(text) {
    var log = $("#log").html();
    $("#log").html(text + "\n<br />" + log);
}

function hideMenu() {
    $("#menu").hide();   
}

function resetEverything() {
    if (config.progress_bar_timer) {
        nanobar.go( 100 );
        clearTimeout(config.progress_bar_timer);
    }
    resetConfig();
    for (var i = 0; i < config.database.length; i++) {
        for (var j = 0; j < config.database[i].length; j++) {
            resetColor(config.database[i][j].id);
        }
    }
    $("#log").html('');
    $("#level").html('');
    $("#description").html('');
    hideSriYantra();
    showMenu();
}

function showMenu() {
    $("#menu").show();   
}
function hideSriYantra() {
    $("#main_wrapper").hide();
}
function showSriYantra(alignment) {
    $("#wrapper tr td").css("text-align",alignment);
    $("#main_wrapper").show();
}

function updateDescription(description, level) {
    update_description = true;
    if (config.meditating == 1) {
        update_description = false;
    }
    if (config.learning == 1) {
        update_description = false;
        if (level == config.level) {
            update_description = true;
        }
    }
    if (update_description) {
        if (description != ''){
            description = formatDescription(description);
            //console.log(description);
            if (config.learning == 1) {
                description = "Click: "+description;
            }
        }
        $("div#description").html(description);
    }
}

function updateMeditationProgressBar() {
    config.meditation_progress+=0.1;
    nanobar.go( config.meditation_progress );
    config.progress_bar_timer = setTimeout(updateMeditationProgressBar, 100*(config.meditation_time_seconds/100));
}
function updateEmptySpaceProgressBar() {
    config.meditation_progress+=0.1;
    nanobar.go( config.meditation_progress );
    config.progress_bar_timer = setTimeout(updateEmptySpaceProgressBar, 100*(config.empty_space_time_seconds/100));
}

function beginMeditation() {
    $("#message_wrapper").show();
}

function startMeditation(minutes) {
    config.meditation_time_seconds = minutes * 60;
    $("#message_wrapper").hide();
    showSriYantra("center");
    updateMeditationProgressBar();
    config.meditating = 1;
    setTimeout(
        function() {
            clearTimeout(config.progress_bar_timer);
            config.meditation_progress = 0;
            nanobar.go( 100 );
            $("#wrapper").hide();
            updateEmptySpaceProgressBar();
            setTimeout(
                function() {
                    clearTimeout(config.progress_bar_timer);
                    config.meditation_progress = 0;
                    nanobar.go( 100 );
                    config.meditating = 0;
                    $("#wrapper").show();
                },
                1000*config.empty_space_time_seconds
            );
        },
        1000*config.meditation_time_seconds
    );
}

function toTitleCase(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}

function formatDescription(description) {
    description = description.replace(/_/g, ' ');
    description = toTitleCase(description);
    description = description.replace(/ Of /g, ' of ');
    description = description.replace(/ The /g, ' the ');
    description = description.replace(/ To /g, ' to ');
    description = description.replace(/ For /g, ' for ');
    description = description.replace(/ And /g, ' and ');
    return description;
}