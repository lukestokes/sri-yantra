var default_config = {
    'meditation_time_seconds':600,
    'empty_space_time_seconds':30,
    'meditating':0,
    'meditation_progress':0,
    'progress_bar_timer':null,
    'learning':0,
    'level':0,
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

    $("#my-map area").mouseover(function(){
        filename = getFileName(this.href);
        changeImage(filename);
        updateDescription(filename);
    }); 
    $("#my-map area").mouseout(function(){
        resetImage();
        var filename = '';
        if (config.learning == 1 && config.entries.length) {
            filename = config.entries[0].filename;
        }
        updateDescription(filename);
    }); 
    $("#my-map area").click(function(){
        if (config.learning == 1) {
            filename = getFileName(this.href);
            if (config.entries.length && config.entries[0].filename == filename) {
                updateLog(getDescription(filename));
                config.entries.shift();
                if (config.entries.length == 0) {
                    config.level++;
                    updateLevel();
                    updateLog("<strong>=== Reached Level " + config.level + " ===</strong>");
                    resetImage();
                    if (config.level == 10) {
                        resetEverything();
                        alert("Congratulations!");
                        return false;
                    }
                    getRandomEntries();
                }
                updateDescription(config.entries[0].filename);
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
        updateDescription(config.entries[0].filename);
        updateLevel();
        return false;
    });
    $("#return_menu").click(function(){
        resetEverything();
        return false;
    });
});

function resetConfig() {
    config = JSON.parse(JSON.stringify(default_config));
    updateDatabase();
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
    for (var i = $("#my-map area").length - 1; i >= 0; i--) {
        filename = getFileName($("#my-map area")[i].href);
        level = getLevel(filename);
        if (!(level in config.database)) {
            config.database[level] = [];
        }
        var entry = {"filename":filename, "description":getDescription(filename)};
        // skip duplicates
        var already_exists = false;
        for (var j = 0; j < config.database[level].length; j++) {
            if (config.database[level][j].filename == filename) {
                already_exists = true;
            }
        }
        if (!already_exists) {
            config.database[level][config.database[level].length] = entry;
        }
    }
}

function getRandomEntries() {
    if (config.level == 0) {
        config.level++;
    }
    var entries = [...config.database[config.level]];
    shuffleArray(entries);
    config.entries = [...entries];
}

function updateLevel() {
    var level_text = "Level: " + config.level;
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

function getFileName(href) {
    filename = href.substring(href.lastIndexOf('/')+1);
    return filename;
}

function resetImage() {
    $("#main").attr("src","images/sri_yantra_white.png");
}

function changeImage(filename) {
    show_image = true;
    if (config.meditating == 1) {
        show_image = false;
    }
    if (config.learning == 1) {
        show_image = false;
        if (getLevel(filename) == config.level) {
            show_image = true;
        }
    }
    if (show_image) {
        $("#main").attr("src","images/"+filename);
    }
}

function updateDescription(filename) {
    update_description = true;
    if (config.meditating == 1) {
        update_description = false;
    }
    if (config.learning == 1) {
        update_description = false;
        if (getLevel(filename) == config.level) {
            update_description = true;
        }
    }
    if (update_description) {
        var description = '';
        if (filename != ''){
            description = getDescription(filename);
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
            config.meditating = 0;
            changeImage('white_background.png');
            updateEmptySpaceProgressBar();
            config.meditating = 1;
            setTimeout(
                function() {
                    clearTimeout(config.progress_bar_timer);
                    config.meditation_progress = 0;
                    nanobar.go( 100 );
                    config.meditating = 0;
                    resetImage();
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

function getLevel(filename) {
    level = 0;
    var section = filename.substring('sri_yantra_'.length);
    section = section.substring(0,section.indexOf("_"));
    if (section >= 0 && level <= 8) {
        level = 1;
    }
    if (section == "circle") {
        level = 2;
    }
    if (section == "po") {
        level = 3;
    }
    if (section == "pi") {
        level = 4;
    }
    if (section == "c1") {
        level = 5;
    }
    if (section == "c2") {
        level = 6;
    }
    if (section == "c3") {
        level = 7;
    }
    if (section == "c4") {
        level = 8;
    }
    if (section == "center") {
        level = 9;
    }
    return level;
}

function getDescription(filename) {
    var description = filename.substring('sri_yantra'.length+1);
    description = description.substring(description.indexOf("_")+1);
    description = description.substring(0, description.length-4);
    description = description.replace(/_/g, ' ');
    description = toTitleCase(description);
    description = description.replace(/ Of /g, ' of ');
    description = description.replace(/ The /g, ' the ');
    description = description.replace(/ To /g, ' to ');
    description = description.replace(/ For /g, ' for ');
    description = description.replace(/ And /g, ' and ');
    return description;
}