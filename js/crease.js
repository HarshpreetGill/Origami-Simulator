/*
a crease module is a feature that allows the user to create and edit crease patterns, which 
are the set of folded lines that define the geometry of the final origami model.
include tools for analyzing the geometry of the crease pattern, such as calculating the angles 
between adjacent creases, and identifying any points where multiple creases intersect.
*/

function Crease(edge, face1Index, face2Index, targetTheta, type, node1, node2, index){
    //type = 0 panel, 1 crease

    //face1 corresponds to node1, face2 to node2
    this.edge = edge;
    for (var i=0;i<edge.nodes.length;i++){
        edge.nodes[i].addInvCrease(this);
    }
    this.face1Index = face1Index;//todo this is useless
    this.face2Index = face2Index;
    this.targetTheta = targetTheta;
    this.type = type;
    this.node1 = node1;//node at vertex of face 1
    this.node2 = node2;//node at vertex of face 2
    this.index = index;
    node1.addCrease(this);
    node2.addCrease(this);
}

Crease.prototype.getLength = function(){
    return this.edge.getLength();
};

Crease.prototype.getVector = function(fromNode){
    return this.edge.getVector(fromNode);
};

Crease.prototype.getNormal1Index = function(){
    return this.face1Index;
};

Crease.prototype.getNormal2Index = function(){
    return this.face2Index;
};//face2Index is a property of the Crease object that represents the index of the second face 
//that the crease intersects.

Crease.prototype.getTargetTheta = function(){
    return this.targetTheta;
};// targetTheta is a property of the Crease object that represents the desired angle of the crease.
// The getTargetTheta() method simply returns this value.

Crease.prototype.getK = function(){
    var length = this.getLength();
    if (this.type == 0) return globals.panelStiffness*length;
    return globals.creaseStiffness*length;
};// getK() method calculates and returns the stiffness of the crease, 
//which depends on its length and type.

//If the type property of the Crease object is 0, the crease is a "panel" fold and its stiffness 
//is determined by multiplying the length of the crease by a global variable globals.panelStiffness.

//If the type property of the Crease object is not 0, the crease is a "mountain" or "valley" fold
// and its stiffness is determined by multiplying the length of the crease by a global variable 
//globals.creaseStiffness.

Crease.prototype.getD = function(){
    return globals.percentDamping*2*Math.sqrt(this.getK());
};

Crease.prototype.getIndex = function(){
    return this.index;
};

Crease.prototype.getLengthToNode1 = function(){
    return this.getLengthTo(this.node1);
};

Crease.prototype.getLengthToNode2 = function(){
    return this.getLengthTo(this.node2);
};

Crease.prototype.getCoef1 = function(edgeNode){
    return this.getCoef(this.node1, edgeNode);
};
Crease.prototype.getCoef2 = function(edgeNode){
    return this.getCoef(this.node2, edgeNode);
};

Crease.prototype.getCoef = function(node, edgeNode){
    var vector1 = this.getVector(edgeNode);
    var creaseLength = vector1.length();
    vector1.normalize();
    var nodePosition = node.getOriginalPosition();
    var vector2 = nodePosition.sub(edgeNode.getOriginalPosition());
    var projLength = vector1.dot(vector2);
    var length = Math.sqrt(vector2.lengthSq()-projLength*projLength);
    if (length <= 0.0) {
        console.warn("bad moment arm");
        length = 0.001;
    }
    return (1-projLength/creaseLength);
}; //calculates the coefficient of a crease, which is a measure of how much a node is displaced 
//from its original position along the crease. 

Crease.prototype.getLengthTo = function(node){
    var vector1 = this.getVector().normalize();
    var nodePosition = node.getOriginalPosition();
    var vector2 = nodePosition.sub(this.edge.nodes[1].getOriginalPosition());
    var projLength = vector1.dot(vector2);
    var length = Math.sqrt(vector2.lengthSq()-projLength*projLength); //pythagorean thm
    if (length <= 0.0) {
        console.warn("bad moment arm");
        length = 0.001;
    }
    return length;
};//calculates the length of the moment arm between a crease and a given node.

Crease.prototype.getNodeIndex = function(node){
    if (node == this.node1) return 1;
    else if (node == this.node2) return 2;
    else if (node == this.edge.nodes[0]) return 3;
    else if (node == this.edge.nodes[1]) return 4;
    console.log("unknown node type");
    return 0;
};

Crease.prototype.setVisibility = function(){
    var vis = false;
    if (this.type==0) vis = globals.panelsVisible;
    else {
        vis = (this.targetTheta>0 && globals.mtnsVisible) || (this.targetTheta<0 && globals.valleysVisible);
    }
    this.edge.setVisibility(vis);
};

Crease.prototype.destroy = function(){
    this.node1.removeCrease(this);
    this.node2.removeCrease(this);
    if (this.edge && this.edge.nodes){
        for (var i=0;i<this.edge.nodes.length;i++){
            this.edge.nodes[i].removeInvCrease(this);
        }
    }
    this.edge = null;
    this.face1Index = null;
    this.face2Index = null;
    this.targetTheta = null;
    this.type = null;
    this.node1 = null;
    this.node2 = null;
    this.index = null;
};