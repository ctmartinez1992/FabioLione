module.exports = {
    Struct: (...keys) => ((...v) => keys.reduce((o, k, i) => {o[k] = v[i]; return o} , {})),

    MillisToMinutesAndSeconds: function(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return (minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
    },

    //min and max are inclusive.
    GetRandomIntInRange: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};