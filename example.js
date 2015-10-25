// require
var NpmPluginsLoader = require('./index.js');


// init
var pluginsLoader = new NpmPluginsLoader({
    npmInstallCommand : 'cnpm install',
    pluginsConfig : {
        'lodash' : {
            foo : 1,
            bar : 2
        }
    }
});


// start load them with configs.
pluginsLoader.load();