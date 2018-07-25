var bestModel = new Vue({
    el: "#best-model",
    data:{
        modelName: "Best Model Name",
        modelLoss: "10"
    }
})

var latestModel = new Vue({
    el: '#latest-model',
    data: {
        modelDesc:"This is a model desc",
        modelMachine: "null machine",
        modelDate: new Date(),
        modelName: "Test Vue Model Name",
        modelStatus: "null Lol",
        modelTrainingSize: 0,
        modelTestingSize: 0,
        modelEpoch: -1,
        modelLoss: 0.0000,
        modelValLoss: 0.00001,
        modelDataset: "Loading...",

        modelCfgEpochs: 0,
        modelCfgLearningRate: 0,
        modelCfgBatchSize: 0,
        modelCfgConv1Filter: 0,
        modelCfgConv1Kernal: 0,
        modelCfgConv2Filter: 0,
        modelCfgConv2Kernal: 0,
        modelCfgFullyConnected: 0,

        modelEnvAutoupdate: false,
        modelEnvLidarPoints: 0,
        modelEnvLidarNoise: 0,
        modelEnvLidarFailure: 0,
        modelEnvLidarMaxRange: 0
    }
})
var allModels = new Vue({
    el: '#all-models',
    data: {
        models: []
    },
    methods: {
        select: function (id) {
            var index = id;

            

            updateSelection(index);

        }
    }
})

var currentSelection = 0;


updateSelection = (index) => {
    currentSelection = index;
    updateModels();
}
updateModels();

setInterval(() => {
    updateModels();
}, 10000)


function updateAllCharts(runs) {
    var data = [];
    for(var i=0;i<5;i++){
        var run = runs[i];
        if(run['info_losses']){
            var trace = {
                x: [],
                y: [],
                name: run.info_name,
                type: 'scatter',
                margin: { t: 0 }
            };
            for(var j=0;j<run['info_losses'].length;j++){
                trace.x.push(j);
                trace.y.push(run['info_losses'][j])
            }

            if(run.info_status == "Complete"){
                //document.getElementById(run.graph_index).className += " bg-success text-white"
            }
            //Plotly.newPlot(run.graph_index, [trace]);

            data.push(trace)
        }
    }
    
    
   

    Plotly.newPlot('allloss-chart', data);

    
}


function updateCurrentCharts(losses) {
    var trace = {
        x: [],
        y: [],
        type: 'scatter'
    };
    for(var i=0;i<losses.length;i++){
        trace.x.push(i);
        trace.y.push(losses[i]);
    }
    

    var data = [trace];

    Plotly.newPlot('loss-chart', data);

    
}

function updateModels() {
    $.getJSON('https://us-central1-victory-net.cloudfunctions.net/fetch-models', function (data) {
        for(var i=0;i<data.length;i++){
            data[i].index = i;
            data[i].graph_index = "model-graph-"+i;
        }

        allModels.models = data;

        var latest = data[currentSelection];
        console.log("Selecting: " + currentSelection);
        if(!latest){return;}
        if(latest['info_losses']){
            updateCurrentCharts(latest['info_losses'])
        }

        updateAllCharts(data);

        if(latest['info_progress']){
            document.getElementById("progress").style["width"] = (latest['info_progress'] * 100) + "%";
        }
        
    
        latestModel.modelDataset = latest['info_dataset'] ||  "Unknown / Legacy Dataset"
        latestModel.modelDesc = latest['info_desc']
        latestModel.modelMachine = latest['info_machine']
        latestModel.modelName = latest['info_name']
        latestModel.modelDate = latest['info_date']
        latestModel.modelStatus = latest['info_status']

        latestModel.modelTrainingSize = latest['info_training_length']
        latestModel.modelTestingSize = latest['info_testing_length']

        latestModel.modelEpoch = latest['info_epoch']
        latestModel.modelLoss = latest['info_loss']
        latestModel.modelValLoss = latest['info_val_loss']

        latestModel.modelCfgEpochs = latest['cfg_epoch']
        latestModel.modelCfgLearningRate = latest['cfg_learning_rate']
        latestModel.modelCfgBatchSize = latest['cfg_batch_size']
        latestModel.modelCfgConv1Filter = latest['cfg_conv1_filter']
        latestModel.modelCfgConv1Kernal = latest['cfg_conv1_kernal']
        latestModel.modelCfgConv2Filter = latest['cfg_conv2_filter']
        latestModel.modelCfgConv2Kernal = latest['cfg_conv2_kernal']
        latestModel.modelCfgFullyConnected = latest['cfg_fully_connected']

        latestModel.modelEnvAutoupdate = latest['env_instantMode']
        latestModel.modelEnvLidarPoints = latest['env_lineNum']
        latestModel.modelEnvLidarNoise = latest['env_noise']
        latestModel.modelEnvLidarFailure = latest['env_dropout']
        latestModel.modelEnvLidarMaxRange = latest['env_maxRange']


        if(parseFloat(latest['info_loss']) < parseFloat(bestModel.modelLoss)){
            bestModel.modelLoss = latest['info_loss'];
            bestModel.modelName = latest['info_name'];
        }
        console.log(data)
    });

}