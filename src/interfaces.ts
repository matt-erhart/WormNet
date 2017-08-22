type neuronId = string;
type linkId = string;
type propagationId = string;
type linkChangesId = string;
/**
@param  id: unique id (e.g. "RQGrZuE-TtHxKaZG-F_Ws5NC") 
    used to access info
    I use https://www.npmjs.com/package/uid-safe in javascript
*/
interface neuron {
  position: number[]; //2d number array
  neurotransmitters?: "acetycholine" | "gaba" | string; //specific names or any string
  type: "excites" | "inhibits" | string; //used for neuron color
  label: string; // display name
  id: neuronId; // unique id. consider adding the label to a random string. makes debugging easier
  spikeTimes: number[]; // e.g. [0, 100, 101, 102, ..., 600, 642]
}

/**
 * @param id - unique among all ids, used for rendering
 * @param source.id - id of neuron connected by the link
 * @param target.id - id of neuron connected by the link
 * these are the links that will be rendered
 * could derive them from propgation data
 */
interface link {
  id: linkId;
  source: { id: neuronId };
  target: { id: neuronId };
  strength?: number;
  distance?: number;
  speed?: number;
}

/**
 * @param id - unique among all ids, used in animation
 */
interface propagation {
  id: propagationId;
  source: { id: neuronId; activationTime: number };
  target: { id: neuronId; activationTime: number };
}

interface jsonOutput {
  neurons: neuron[]; // array of objects
  links: link[]; // array of objects
  propagations: propagation[]; // array of objects
}

let exampleJson = {
  neurons: [
    {
      //the random strings is just a good habit to ensure uniqueness
      //easy to end up using e.g. 'neuron1' again as we add more data or want to compare conditions
      id: "neuron1-RQGrZuE-TtHxKaZG-F_Ws5NC",
      neurotransimmters: "gaba",
      type: "inhibits",
      label: "neuron1",
      spikeTimes: [9, 15, 22, 101],
      position: [1,0]
    },
    {
      id: "neuron2-8YUEbz_hYCK0gIEIdALqxigW",
      neurotransimmters: "gaba",
      type: "inhibits",
      label: "neuron2",
      spikeTimes: [9, 15, 22, 101],
      position: [1,2]
    }
  ],
  links: [
    {
      //note: we would not want a copy of this with the source/target flipped
      id: "link1-y6MdYgK1QV4Q2vsigui5vTDD",
      source: { id: "neuron1-RQGrZuE-TtHxKaZG-F_Ws5NC" },
      target: { id: "neuron2-8YUEbz_hYCK0gIEIdALqxigW" }
    }
  ],
  propagations: [
    {
      id: "propgation1-aS011KUMuEiTUA4amA4wjsFv",
      source: { id: "neuron1-RQGrZuE-TtHxKaZG-F_Ws5NC", activationTime: 0 },
      target: { id: "neuron2-8YUEbz_hYCK0gIEIdALqxigW", activationTime: 10 }
    },
    {
      id: "propgation2-aS011KUMuEiTUA4amA4wjsFv",
      source: { id: "neuron2-8YUEbz_hYCK0gIEIdALqxigW", activationTime: 23 },
      target: { id: "neuron1-RQGrZuE-TtHxKaZG-F_Ws5NC", activationTime: 11 }
    }
  ]
};
