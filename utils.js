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
  },
  
  //Copies the values of source to array.
  CopyArray: function(source, array) {
    var index = -1;
    const length = source.length;
    array || (array = new Array(length));
    while (++index < length) {
      array[index] = source[index];
    }

    return array;
  },

  //Creates an array of shuffled values, using a version of the Fisher-Yates shuffle.
  ShuffleArray: function(array) {
    const length = array == null ? 0 : array.length;
    if (!length) {
      return [];
    }

    var index = -1;
    const lastIndex = length - 1;
    const result = module.exports.CopyArray(array);

    while (++index < length) {
      const rand = index + Math.floor(Math.random() * (lastIndex - index + 1))
      const value = result[rand]
      result[rand] = result[index]
      result[index] = value
    }

    return result
  },

  //Creates an array with all falsey values removed. The values false, null, 0, "", undefined, and NaN are falsey.
  CompactArray: function(array) {
    let resIndex = 0
    const result = []

    if (array == null) {
      return result
    }

    for (const value of array) {
      if (value) {
        result[resIndex++] = value
      }
    }
    return result
  }
};
