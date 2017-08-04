var csv = require("fast-csv");
var d3 = require("d3");
var dataDir = "C:/Users/me/Google Drive/wormNet/wormNet/src/assets/data/";
var jsonfile = require("jsonfile");

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
  getCsvData(dataDir + "277_dist_adj_mat.dat")
]).then(data => {
  let pos = data[0];
  let spikes = data[1];
  let labels = data[2];
  let linkMat = data[3];

  let links = []
  linkMat.forEach((row, rowi) => {
    row.forEach((col, coli) => {
      if (col !== 'Inf') {
        links.push({source: rowi, target: coli, value: col, sourcePos: pos[rowi], targetPos: pos[coli]})
      }
    });
  });

  
  let json = [];
  pos.forEach((val, i) => {
    json.push({ pos: val, spikes: spikes[i], label: labels[i][0] });
  });
  jsonfile.writeFile(dataDir + "data.json", json, { spaces: 2 }, function(err) {
    console.error(err);
  });
  jsonfile.writeFile(dataDir + "links.json", links, { spaces: 2 }, function(err) {
    console.error(err);
  });
});
