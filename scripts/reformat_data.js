var csv = require("fast-csv");
var d3 = require("d3");
var dataDir = "C:/Users/me/Google Drive/wormNet/wormNet/src/assets/data/277/";
var jsonfile = require("jsonfile");
var uid = require("uid-safe");
var _ = require("lodash");
var mkdirp = require("mkdirp");

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
  getCsvData(dataDir + "neuronPositions.txt"), //neuronPositions.txt
  getCsvData(dataDir + "spikes_neuronRows_timeCols.csv"), //spikes_neuronRows_timeCols.csv
  getCsvData(dataDir + "neuronLabels.txt"), //neuronLabels.txt
  // getCsvData(dataDir + "277_dist_adj_mat.dat"), //
  getCsvData(
    //csvValueActivatesCsvRow_NeuronIndex.csv
    dataDir + "csvValueActivatesCsvRow_NeuronIndex.csv"
  ),
  getCsvData(
    //csvValueActivatesCsvRow_TimePoint.csv
    dataDir + "csvValueActivatesCsvRow_TimePoint.csv"
  ),
  getCsvData(dataDir + "neuronType.txt") //neuronType.txt
]).then(data => {
  let pos = data[0];
  let spikes = data[1];
  let labels = data[2];
  // let linkMat = data[3];
  let csvValueActivatesCsvRow_NeuronIndex = data[3]; //matrix same size as data[5]
  let csvValueActivatesCsvRow__TimePoint = data[4];
  let exciteInhibit = data[5];
  console.log('data loaded')
  let timePoints = csvValueActivatesCsvRow_NeuronIndex[0].map(x => +x);
  let neuronActivation = csvValueActivatesCsvRow_NeuronIndex.slice(1) //not the time indexs in row1
  let neuronActivationTime = csvValueActivatesCsvRow__TimePoint.slice(1); //not the time indexs in row1

  propagation = [];
  neuronActivation.forEach((row, rowi) => {
    console.log('neuroactivation',rowi)
    row.forEach((col, coli) => {
      const target = rowi;
      const source = +col-1;
      const targetPos = pos[rowi];
      const sourcePos = pos[source];
      const targetActivationTime = timePoints[coli];
      const sourceActivationTime = +neuronActivationTime[rowi][coli];
      const timeDiff = targetActivationTime - sourceActivationTime;
      const targetType = exciteInhibit[target] > 0 ? "excites" : "inhibits";
      const sourceType = exciteInhibit[source] > 0 ? "excites" : "inhibits";
      const id = uid.sync(18);
      
      if (source >= 0) {
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

  propagation.sort((a, b) => a.sourceActivationTime - b.sourceActivationTime);
  const uniqueLinks = _.uniqWith(_.flatten(propagation), (a, b) => {
    const x = [a.source, a.target].sort().toString();
    const y = [b.source, b.target].sort().toString();
    return x === y;
  });
  console.log('got unique links')
  propagationForEachTimePoint = [];
  d3.range(spikes[0].length).forEach(i => {
    console.log('filter', i)
    propagationForEachTimePoint[i] =
      propagation.filter(activation => activation.sourceActivationTime === i) ||
      [];
  });

  let links = [];
  uniqueLinks.forEach((val, i) => {
    console.log('unique links', i)
    const { sourcePos, targetPos, source, target } = val;
    if (sourcePos) {
      //278 is stimulus node
      links.push({
        id: uid.sync(18),
        source,
        target,
        targetType: exciteInhibit[target] > 0 ? "excites" : "inhibits",
        sourceType: exciteInhibit[source] > 0 ? "excites" : "inhibits",
        sourcePos: sourcePos.map(x => +x),
        targetPos: targetPos.map(x => +x)
      });
    }
  });

  // linkMat.forEach((row, rowi) => {
  //   row.forEach((col, coli) => {
  //     if (col !== "Inf") {
  //       links.push({
  //         source: rowi,
  //         target: coli,
  //         targetType: exciteInhibit[coli] > 0 ? 'excites' : 'inhibits',
  //         sourceType: exciteInhibit[rowi] > 0 ? 'excites' : 'inhibits',
  //         value: +col,
  //         sourcePos: pos[rowi].map(x=>+x),
  //         targetPos: pos[coli].map(x=>+x)
  //       });
  //     }
  //   });
  // });

  const outdir = dataDir + "/json/";

  let json = [];
  pos.forEach((val, i) => {
    json.push({
      pos: val.map(x => +x),
      type: exciteInhibit[i] > 0 ? "excites" : "inhibits",
      label: labels[i][0],
      spikes: spikes[i].map(x => +x)
    });
  });
console.log('writing')
  mkdirp(outdir, (err) => {
    jsonfile.writeFile(outdir + "data.json", json, { spaces: 2 }, function(
      err
    ) {
      console.error(err);
    });
    jsonfile.writeFile(outdir + "links.json", links, { spaces: 2 }, function(
      err
    ) {
      console.error(err);
    });
    jsonfile.writeFile(
      outdir + "propagation.json",
      propagationForEachTimePoint,
      { spaces: 2 },
      function(err) {
        console.error(err);
      }
    );
  });
});
