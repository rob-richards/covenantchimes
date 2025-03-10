var $ = require('jquery');

var app = {
    init() {
        app.loadWeather();
    },

    loadWeather() {
        $.ajax({
            type: "GET",
            url: "https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='raleigh, nc')&format=json",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            success: function(data) {
                console.table(data.query.results);
                let dataCondition = data.query.results.channel.item.condition;
                let temp          = dataCondition.temp;
                let condition     = dataCondition.text;
                let windSpeed     = data.query.results.channel.wind.speed;

                app.loadTemp(temp, condition);
                app.animateChime(windSpeed);

                app.loadReverb();
                app.loadAmbience(condition);
                app.loadChimes();
                app.loadDrone();

                app.playerControls();
            },
            error: function(xhr, errorText) {
                console.log('Error ' + xhr.errorText);
            }
        });
    },

    playerControls() {
        const $playerControls = $("#player-controls");
        const $masterVolume   = $playerControls.find("#master-volume");
        const $masterMute     = $playerControls.find("#master-mute");
        const $droneMute      = $playerControls.find("#drone-mute");

        $masterVolume.on('input change', (event) => {
            event.preventDefault();
            let volumeVal = parseInt($masterVolume.val());

            Tone.Master.volume.value = volumeVal;
        });

        $masterMute.change(() => {
            if ($masterMute.prop('checked')) {
                Tone.Master.mute = true;
            } else {
                Tone.Master.mute = false;
            }
        });
    },

    loadReverb() {
        freeverb = new Tone.Freeverb().toMaster();
        freeverb.wet.value = 0.4;
        freeverb.roomSize.value = 2;
        freeverb.dampening.value = 500;
    },

    loadChimes(sample, pitch, attack, velocity) {
        if (sample != undefined) {
            var chimes = new Tone.Sampler("./assets/audio/" + sample, function(){
                chimes.triggerAttack(pitch, "0", 0.1);
                chimes.volume.value = 0;
            }).connect(freeverb).toMaster();
        }
    },

    loadAmbience(condition) {
        let ambienceSample,
            ambienceSampleVolume;

        if (condition.includes("Rain")) {
            ambienceSample = "./assets/audio/heavy-rain.mp3";
            ambienceSampleVolume = -9;
        } else {
            ambienceSample = "./assets/audio/very-low-wind.wav";
            ambienceSampleVolume = 15;
        }

        console.log(condition + ' - ' + ambienceSample);

        var ambience = new Tone.Sampler(ambienceSample, function() {
            ambience.triggerAttack(0, "0", 1);
            ambience.loop = 'true';
            ambience.volume.value = ambienceSampleVolume;

        }).toMaster();
    },

    loadDrone() {
        var drone = new Tone.Sampler("./assets/audio/drone-cello-f.mp3", function() {
            drone.triggerAttack(0, "0", 0.1);
            drone.loop = 'true';
            drone.volume.value = 1;


            $("#player-controls").find("#drone-mute").change(() => {
                if ($("#player-controls").find("#drone-mute").prop('checked')) {
                    drone.volume.value = -1000;
                } else {
                    drone.volume.value = 1;
                }
            });


        }).toMaster();
    },

    loadTemp(temp, condition) {
        $('#current-weather').html(temp + "&deg; & " + condition);
    },

    animateChime(windSpeed) {
        console.log(windSpeed);

        //Wind speed faster than 74mph is a hurricane
        let swingProbability = Math.ceil((100 * windSpeed) / 74) / 100;
        const pitchArray = [-3, -5, -8, -10, -12];

        $('.chime-bell').each(function(i, val) {
            let randomNum = (Math.random() * swingProbability);
            randomNum = randomNum.toFixed(2);

            console.log(swingProbability + " - " + randomNum);

            if (randomNum >= 0.01 && randomNum <= 0.14) {
                let animationDuration = randomNum * 50;

                if (animationDuration < 2) {
                    animationDuration = 2;
                }

                $('.chime-bell')
                    .eq(i)
                    .addClass('swing-slow')
                    .css('animation-delay', (i * 100) + 'ms')
                    .css('animation-duration', animationDuration + 's');

                randomNum = 0;

                setInterval(function(){
                    var rand = pitchArray[Math.floor(Math.random() * pitchArray.length)];
                    app.loadChimes("chime-f3-a.wav", rand);
                }, animationDuration * 1000);

            } else if (randomNum <= 0.30 && randomNum >= 0.15) {
                let animationDuration = randomNum * 40;

                if (animationDuration < 1.8) {
                    animationDuration = 1.8;
                }

                $('.chime-bell')
                    .eq(i)
                    .removeClass('swing-slow')
                    .addClass('swing-med')
                    .css('animation-delay', (i * 100) + 'ms')
                    .css('animation-duration', animationDuration + 's');

                randomNum = 0;

                setInterval(function(){
                    var rand = pitchArray[Math.floor(Math.random() * pitchArray.length)];
                    app.loadChimes("chime-f3-b.wav", rand);
                }, animationDuration * 1000);

            } else if (randomNum >= 0.31) {
                let animationDuration = randomNum * 30;

                if (animationDuration < 1.6) {
                    animationDuration = 1.6;
                }

                $('.chime-bell')
                    .eq(i)
                    .removeClass('swing-fast')
                    .addClass('swing-med')
                    .css('animation-delay', (i * 100) + 'ms')
                    .css('animation-duration', animationDuration + 's');

                randomNum = 0;

                setInterval(function(){
                    var rand = pitchArray[Math.floor(Math.random() * pitchArray.length)];
                    app.loadChimes("chime-f3-a.wav", rand);
                }, animationDuration * 500);

            }

        });
    }
};

app.init();