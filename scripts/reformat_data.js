var csv = require("fast-csv");
var d3 = require("d3");
var dataDir = "C:/Users/me/Google Drive/wormNet/wormNet/src/assets/data/";
var jsonfile = require("jsonfile");
var uid = require('uid-safe')

function getCsvData(path) {
  return new Promise((resolve, reject) => {
    let data = [];
    csv
      .fromPath(path)
      .on("data", function(row) {
        data.push(row);
      })
      .on("end", () => {
        resolve(data);
      });
  });
}

Promise.all([
  getCsvData(dataDir + "277_positions.dat"),
  getCsvData(dataDir + "spikeMat.csv"),
  getCsvData(dataDir + "celldata.dat"),
  getCsvData(dataDir + "277_dist_adj_mat.dat"),
  getCsvData(
    dataDir +
      "out_Mot_Glu_1_unknownNrn_1_Protocol_1_SignalSpeed_0.2_refPer_1.6.csv"
  ),
  getCsvData(
    dataDir +
      "out_Tst_Glu_1_unknownNrn_1_Protocol_1_SignalSpeed_0.2_refPer_1.6.csv"
  ),
  getCsvData(dataDir + "277_Labels_neurotransmitters_inh_exc_0_1.txt"),
  
]).then(data => {
  let pos = data[0];
  let spikes = data[1];
  let labels = data[2];
  let linkMat = data[3];
  let csvValueActivatesCsvRow_NeuronIndex = data[4]; //matrix same size as data[5]
  let csvValueActivatesCsvRow__TimePoint = data[5];
  let exciteInhibit = data[6];
  let timePoints = csvValueActivatesCsvRow_NeuronIndex[0].map(x=>+x)
  let neuronActivation = csvValueActivatesCsvRow_NeuronIndex.slice(1); //not the time indexs in row1
  let neuronActivationTime = csvValueActivatesCsvRow__TimePoint.slice(1); //not the time indexs in row1

  propagation = [];
  neuronActivation.forEach((row, rowi) => {
    row.forEach((col, coli) => {
      const target = rowi;
      const source = +col;
      const targetPos = pos[rowi];
      const sourcePos = pos[source]
      const targetActivationTime = timePoints[coli];
      const sourceActivationTime = +neuronActivationTime[rowi][coli];
      const timeDiff = targetActivationTime - sourceActivationTime;
      const targetType = exciteInhibit[target] > 0 ? 'excites' : 'inhibits'
      const sourceType = exciteInhibit[source] > 0 ? 'excites' : 'inhibits'
      const id = uid.sync(18);
      if (source !== 0) {
        propagation.push({
          source,
          target,
          sourcePos,
          targetPos,
          targetType,
          sourceType,
          targetActivationTime,
          sourceActivationTime,
          timeDiff,
          id
        });
      }
    });
  });

  propagation.sort((a,b)=>a.sourceActivationTime-b.sourceActivationTime);

  propagationForEachTimePoint = [];
  d3.range(6000).forEach(i => {
    propagationForEachTimePoint[i] = propagation.filter(activation => activation.sourceActivationTime === i) || [];
  })

  let links = [];
  linkMat.forEach((row, rowi) => {
    row.forEach((col, coli) => {
      if (col !== "Inf") {
        links.push({
          source: rowi,
          target: coli,
          targetType: exciteInhibit[coli] > 0 ? 'excites' : 'inhibits',
          sourceType: exciteInhibit[rowi] > 0 ? 'excites' : 'inhibits',
          value: +col,
          sourcePos: pos[rowi].map(x=>+x),
          targetPos: pos[coli].map(x=>+x)
        });
      }
    });
  });

  let json = [];
  pos.forEach((val, i) => {
    json.push({ pos: val.map(x=>+x), type: exciteInhibit[i] > 0 ? 'excites' : 'inhibits' , label: labels[i][0], spikes: spikes[i].map(x=>+x) });
  });
  jsonfile.writeFile(dataDir + "data.json", json, { spaces: 2 }, function(err) {
    console.error(err);
  });
  jsonfile.writeFile(dataDir + "links.json", links, { spaces: 2 }, function(
    err
  ) {
    console.error(err);
  });
  jsonfile.writeFile(dataDir + "propagation.json", propagationForEachTimePoint, { spaces: 2 }, function(
    err
  ) {
    console.error(err);
  });
});
