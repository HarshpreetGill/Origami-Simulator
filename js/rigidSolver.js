/**
 * a rigid solver module in an origami simulator can provide a powerful tool for testing and 
 * refining origami designs, helping the user to create more accurate and stable models 
 */

function initRigidSolver(){

    var nodes;
    var edges;
    var faces;
    var creases;
    var positions;

    var C, F;

    function syncNodesAndEdges(){
        nodes = globals.model.getNodes();
        edges = globals.model.getEdges();
        faces = globals.model.getFaces();
        creases = globals.model.getCreases();

        positions = globals.model.getPositionsArray();
        setUpParams();
    }

    function solve(){
        updateMatrices();
        solveStep();
    }
    function reset(){
    }
    function pinv(A) {
        var z = numeric.svd(A), foo = z.S[0];
        var U = z.U, S = z.S, V = z.V;
        var m = A.length, n = A[0].length, tol = Math.max(m,n)*numeric.epsilon*foo,M = S.length;
        var i,Sinv = new Array(M);
        for(i=M-1;i!==-1;i--) { if(S[i]>tol) Sinv[i] = 1/S[i]; else Sinv[i] = 0; }
        return numeric.dot(numeric.dot(V,numeric.diag(Sinv)),numeric.transpose(U))
    }

    function solveStep(){
        var X = numeric.dot(numeric.sub(numeric.identity(3*nodes.length),
            numeric.dot(numeric.transpose(pinv(numeric.transpose(C))), C)), F);//todo valid psuedoinv?
     
        console.log(X);

        render(X);
    }

    function render(X){

        for (var i=0;i<nodes.length;i++){
            var nodePosition = new THREE.Vector3(X[3*i], X[3*i+1], X[3*i+2]);
            var nexPos = nodes[i].renderDelta(nodePosition);
            positions[3*i] = nexPos.x;
            positions[3*i+1] = nexPos.y;
            positions[3*i+2] = nexPos.z;
        }
        for (var i=0;i<edges.length;i++){
            edges[i].render();
        }
    }

    function initEmptyArray(dim1, dim2, dim3){
        if (dim2 === undefined) dim2 = 0;
        if (dim3 === undefined) dim3 = 0;
        var array = [];
        for (var i=0;i<dim1;i++){
            if (dim2 == 0) array.push(0);
            else array.push([]);
            for (var j=0;j<dim2;j++){
                if (dim3 == 0) array[i].push(0);
                else array[i].push([]);
                for (var k=0;k<dim3;k++){
                    array[i][j].push(0);
                }
            }
        }
        return array;
    }


    function setUpParams(){
        C = initEmptyArray(edges.length, 3*nodes.length);//todo change size

        F = initEmptyArray(3*nodes.length);
    }

    function updateMatrices(){
        var numNodes = nodes.length;
        var numEdges = edges.length;
        F = initEmptyArray(3*numNodes);
        for (var j=0;j<numEdges;j++){
            var edge = edges[j];
            var _nodes = edge.nodes;
            var edgeVector0 = edge.getVector(_nodes[0]);

            var length = edge.getOriginalLength();
            var diff = edgeVector0.length() - length;
            var rxnForceScale = globals.axialStiffness*diff/length;

            edgeVector0.normalize();
            var i = _nodes[0].getIndex();
            C[j][3*i] = edgeVector0.x;
            C[j][3*i+1] = edgeVector0.y;
            C[j][3*i+2] = edgeVector0.z;
            F[3*i] -= edgeVector0.x*rxnForceScale;
            F[3*i+1] -= edgeVector0.y*rxnForceScale;
            F[3*i+2] -= edgeVector0.z*rxnForceScale;

            i = _nodes[1].getIndex();
            C[j][3*i] = -edgeVector0.x;
            C[j][3*i+1] = -edgeVector0.y;
            C[j][3*i+2] = -edgeVector0.z;
            F[3*i] += edgeVector0.x*rxnForceScale;
            F[3*i+1] += edgeVector0.y*rxnForceScale;
            F[3*i+2] += edgeVector0.z*rxnForceScale;
        }

        var geometry = globals.model.getGeometry();
        var indices = geometry.index.array;
        var normals = [];

        //compute all normals
        var cb = new THREE.Vector3(), ab = new THREE.Vector3();
        for (var j=0;j<indices.length;j+=3){
            var index = 3*indices[j];
            var vA = new THREE.Vector3(positions[index], positions[index+1], positions[index+2]);
            index = 3*indices[j+1];
            var vB = new THREE.Vector3(positions[index], positions[index+1], positions[index+2]);
            index = 3*indices[j+2];
            var vC = new THREE.Vector3(positions[index], positions[index+1], positions[index+2]);
            cb.subVectors( vC, vB );
            ab.subVectors( vA, vB );
            cb.cross( ab );

            cb.normalize();
            normals.push(cb.clone());
        }


        for (var j=0;j<creases.length;j++){
            var crease = creases[j];
            var normal1 = normals[crease.face1Index];
            var normal2 = normals[crease.face2Index];
            var dotNormals = normal1.dot(normal2);
            if (dotNormals < -1.0) dotNormals = -1.0;
            else if (dotNormals > 1.0) dotNormals = 1.0;

            var creaseVector = crease.getVector().normalize();
            var theta = Math.atan2((normal1.clone().cross(creaseVector)).dot(normal2), dotNormals);

            var diff = theta - globals.creasePercent*crease.targetTheta;
            var rxnForceScale = crease.getK()*diff;

            var partial1, partial2;

            if (!crease.node1.fixed){
                var i = crease.node1.getIndex();
                var dist = crease.getLengthToNode1();
                var partial1 = normal1.clone().divideScalar(dist);
                F[3*i] -= partial1.x*rxnForceScale;
                F[3*i+1] -= partial1.y*rxnForceScale;
                F[3*i+2] -= partial1.z*rxnForceScale;
            }
            if (!crease.node2.fixed){
                var i = crease.node2.getIndex();
                var dist = crease.getLengthToNode2();
                var partial2 = normal2.clone().divideScalar(dist);
                F[3*i] -= partial2.x*rxnForceScale;
                F[3*i+1] -= partial2.y*rxnForceScale;
                F[3*i+2] -= partial2.z*rxnForceScale;
            }
            var creaseNodes = crease.edge.nodes;
            for (var k=0;k<creaseNodes.length;k++){
                var node = creaseNodes[k];
                if (node.fixed) continue;
                var i = node.getIndex();
                F[3*i] += (partial1.x+partial2.x)/2*rxnForceScale;
                F[3*i+1] += (partial1.y+partial2.y)/2*rxnForceScale;
                F[3*i+2] += (partial1.z+partial2.z)/2*rxnForceScale;
            }
        }
    }

    return {
        syncNodesAndEdges: syncNodesAndEdges,
        solve:solve,
        reset:reset
    }
}