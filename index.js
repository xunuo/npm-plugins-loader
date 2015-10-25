var
    fs = require('fs'),
    path = require('path'),
    shell = require('shelljs'),
    merge = require('merge')
    ;


var NpmPluginsLoader = function(customConfig){
    

    var defaultConfig = {
            npmInstallCommand : 'npm install',
            pluginsPrefix : '',
            pluginsConfig : {}
        };
        
    var // 合并配置
        config = merge.recursive(defaultConfig,customConfig),
        // npm 安装命令
        npmInstallCommand = config.npmInstallCommand,
        // 尝试获取所有插件前缀 (如:'@ali/webhooks-plugin-')
        pluginPrefix = config.pluginsPrefix,
        // 获取插件configs
        pluginsConfig = config.pluginsConfig
        ;

    
    // 遍历所有插件配置项
    for( var pluginName in pluginsConfig ){
        
        var 
            // 获取插件npm包全名 (如:'@ali/webhooks-plugin-example')
            pluginFullName = pluginPrefix + pluginName,
            // 获取插件npm包全路径
            pluginFullPath = path.join( process.cwd() , './node_modules/', pluginFullName),
            // 获取插件配置
            pluginConfig = pluginsConfig[pluginName]
            ;
        
        pluginConfig.pluginFullName = pluginFullName;
        
        // 判断是否需要预装插件
        if( !fs.existsSync( pluginFullPath ) ) {
            console.log('Installing : ', pluginFullName, '...');
            var installPluginRes = shell.exec(npmInstallCommand + ' ' + pluginFullName + ' --save', {silent: true}).output.trim();
            if(installPluginRes.indexOf('npm ERR!') !== -1){
                throw new Error('Can\'t install plugin : ' + pluginFullName);
            }else{
                console.log('Installed : ', pluginFullName, '!');
            }
        }
        
    }
    
    // 为所有插件增加配置
    this.mergeAllConfig = function(additionConfig){
        
        for( var pluginName in pluginsConfig ){
            
            // 获取插件配置
            var pluginConfig = pluginsConfig[pluginName];
            
            // 合并配置
            pluginConfig = merge(pluginConfig,additionConfig,true);
            
        }
        
    };
    
    // 加载所有插件
    this.load = function(){
        
        for( var pluginName in pluginsConfig ){
            
            // 获取插件配置
            var pluginConfig = pluginsConfig[pluginName];

            // 引入插件并运行
            var plugin = require(pluginConfig.pluginFullName);
            plugin.call(this,pluginConfig);
            
        }
        
    };
    
};

module.exports = NpmPluginsLoader;