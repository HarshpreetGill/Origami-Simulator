/*
*every object has a PROTOTYPE, which is an object that serves as a template for creating new 
objects of that type. The prototype is an object that contains properties and methods that can 
be inherited by new objects created from it.
*/

/*

 a beam module is a feature that allows the user to simulate the behavior of a folded origami
  model as a collection of interconnected beams.

*/

function Beam(nodes){ 

    this.type = "beam"; //fxn sets the type of beam to 'beam'

    nodes[0].addBeam(this);
    nodes[1].addBeam(this); // and adds them to the list of beams
    this.vertices = [nodes[0]._originalPosition, nodes[1]._originalPosition];
    //ets the vertices of the beam to the original positions of the two nodes 
    //and sets the nodes property to the input nodes.
    this.nodes = nodes; 

   
    this.originalLength = this.getLength();// it calculates and stores the original length of the beam.
}



Beam.prototype.getLength = function(){
    return this.getVector().length();
};// getlength() method ret the current length of the vector between the two nodes.

Beam.prototype.getOriginalLength = function(){
    return this.originalLength;
}; // The getOriginalLength() method returns the original length of the beam, 
 //which is set when the beam is created and can be used for comparison with the current length.

Beam.prototype.recalcOriginalLength = function(){
    this.originalLength = this.getVector().length();
}; // recalculates the original length of the beam based on the current position of the nodes.

Beam.prototype.isFixed = function(){
    return this.nodes[0].fixed && this.nodes[1].fixed;
}; // checks of both the nodes of the beam are fixed in place.

Beam.prototype.getVector = function(fromNode){
    if (fromNode == this.nodes[1]) return this.vertices[0].clone().sub(this.vertices[1]);
    return this.vertices[1].clone().sub(this.vertices[0]);
}; //returns the vector bw the two vertices of the beam which can be used to calculate the length 
// and angle of the beam. the fromNode parameter can be used to specify which node the vector should
// be calculated from



//dynamic solve

Beam.prototype.getK = function(){
    return globals.axialStiffness/this.getLength();
}; //calculates the axial stiffness of the beam by dividing the global axial stiffness by the beams lenght


Beam.prototype.getD = function(){
    return globals.percentDamping*2*Math.sqrt(this.getK()*this.getMinMass());
}; // cals damping coefficint of the beam by multiplying the global percent damping by two times....

Beam.prototype.getNaturalFrequency = function(){
    return Math.sqrt(this.getK()/this.getMinMass());
}; // cals natural frequency of the beam

Beam.prototype.getMinMass = function(){
    var minMass = this.nodes[0].getSimMass();
    if (this.nodes[1].getSimMass()<minMass) minMass = this.nodes[1].getSimMass();
    return minMass;
}; // ret minimum mass of the two nodes of the beam

Beam.prototype.getOtherNode = function(node){
    if (this.nodes[0] == node) return this.nodes[1];
    return this.nodes[0];
}; // takes node as an argument and returns the other node of the beam


//deallocate

Beam.prototype.destroy = function(){
    var self = this;
    _.each(this.nodes, function(node){
        node.removeBeam(self);
    });
    this.vertices = null;
    // this.object3D = null;
    this.nodes = null;
}; //This code defines a method called "destroy" for the Beam object. When called, it iterates
// over all the nodes in the beam and removes the beam from each node's list of connected beams. 
//Then it sets the "vertices" and "nodes" properties of the beam to null, effectively deleting them.
// The commented out line suggests that the "object3D" property may have been intended to be deleted
// as well, but it is currently not being used.