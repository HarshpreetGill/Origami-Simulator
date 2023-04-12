/**
 * 
 * This module allows users to view the folded model in 3D. Users can rotate the model,
 *  zoom in and out, and examine it from different angles.


 * 
 * 
 * raycaster is used to render 3d environments in real time. it works by projecting rays from the
 * players viewpoint and determine which objects or surfaces intersect with those rays.
 * 
 * dragging variables controls how raycaster operates, speed, movement, number etc
 * you might adjust values using sliders or other input controls.
 * 
 * highlighter objects highlight the surface in 3d done by chnaging color, brightness and texture.
 */

function init3DUI(globals) {

    var raycaster = new THREE.Raycaster(); //create raycaster
    var mouse = new THREE.Vector2(); // mouse vector
    var raycasterPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1)); //plane for raycaster intersection
    var isDragging = false; // set intial dragging variables
    var draggingNode = null;
    var draggingNodeFixed = false;
    var mouseDown = false;
    var highlightedObj;

    var highlighter1 = new Node(new THREE.Vector3()); //creatw highlighter obj
    highlighter1.setTransparent();
    globals.threeView.scene.add(highlighter1.getObject3D());



    $(document).dblclick(function() {
    });

    document.addEventListener('mousedown', function(){ //fxn to handle mouse up down
        mouseDown = true;
    }, false);
    document.addEventListener('mouseup', function(e){
        isDragging = false;
        if (draggingNode){
            draggingNode.setFixed(draggingNodeFixed);
            draggingNode = null;
            globals.fixedHasChanged = true;
            globals.threeView.enableControls(true);
            setHighlightedObj(null);
            globals.shouldCenterGeo = true;
        }
        mouseDown = false;
    }, false);
    document.addEventListener( 'mousemove', mouseMove, false );
    function mouseMove(e){

        if (mouseDown) {
            isDragging = true;
        }

        if (!globals.userInteractionEnabled) return;

        //This code checks if the user is able to interact with the application. 
        //If not, the function returns and does not execute any further code. 
        //If the user is able to interact, the code calculates the position of 
        //the mouse within the window and sets the raycaster to that position. 
        //The variable "_highlightedObj" is set to null.

        // e.preventDefault();
        mouse.x = (e.clientX/window.innerWidth)*2-1;
        mouse.y = - (e.clientY/window.innerHeight)*2+1;
        raycaster.setFromCamera(mouse, globals.threeView.camera);

        var _highlightedObj = null;


        if (!isDragging) {
            _highlightedObj = checkForIntersections(e, globals.model.getMesh());
            setHighlightedObj(_highlightedObj);
        }  //If the user is not currently dragging an object, it checks for 
        //intersections between the mouse cursor and the 3D model and sets the highlighted 
        //object accordingly.
        
        else if (isDragging && highlightedObj){
            if (!draggingNode) {
                draggingNode = highlightedObj;
                draggingNodeFixed = draggingNode.isFixed();
                draggingNode.setFixed(true);
                globals.fixedHasChanged = true;
                globals.threeView.enableControls(false);
            }
            var intersection = getIntersectionWithObjectPlane(highlightedObj.getPosition().clone());
            highlightedObj.moveManually(intersection);
            globals.nodePositionHasChanged = true;
        } //If the user is currently dragging an object and there is a highlighted object, it sets 
        //the object being dragged to the highlighted object and fixes its position. It then 
        //calculates the intersection between the object being dragged and the object plane and 
        //moves the object being dragged to that position.

        if (highlightedObj){
            var position = highlightedObj.getPosition();
            highlighter1.getObject3D().position.set(position.x, position.y, position.z);
        } // it sets flags to indicate that the position of the node has changed and that the
        // fixed status of the node has changed.
    }

    function getIntersectionWithObjectPlane(position){
        var cameraOrientation = globals.threeView.camera.getWorldDirection();
        var dist = position.dot(cameraOrientation);
        raycasterPlane.set(cameraOrientation, -dist);
        var intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(raycasterPlane, intersection);
        return intersection; // it returns the intersection point as a vector
    } // It creates a raycaster plane using the camera orientation and distance, and then uses the 
    //raycaster to find the intersection point between the ray and the plane. 

    //This function is likely used to determine where an object intersects with the plane in order 
    //to perform further calculations or actions.

    function setHighlightedObj(object){
        if (highlightedObj && (object != highlightedObj)) {
            // highlightedObj.unhighlight();
            highlighter1.getObject3D().visible = false; // it hides the highlighter for the current object
        }
        highlightedObj = object;
        if (highlightedObj) {
            // highlightedObj.highlight();
            highlighter1.getObject3D().visible = true;
        }
    } //The highlighter is represented by an object called "highlighter1" and its visibility is 
    //controlled by setting its "visible" property to true or false.

    function checkForIntersections(e, objects){
        var _highlightedObj = null;
        var intersections = raycaster.intersectObjects(objects, false);
        if (intersections.length>0){
            var face = intersections[0].face;
            var position = intersections[0].point;
            var positionsArray = globals.model.getPositionsArray();
            var vertices = [];
            vertices.push(new THREE.Vector3(positionsArray[3*face.a], positionsArray[3*face.a+1], positionsArray[3*face.a+2]));
            vertices.push(new THREE.Vector3(positionsArray[3*face.b], positionsArray[3*face.b+1], positionsArray[3*face.b+2]));
            vertices.push(new THREE.Vector3(positionsArray[3*face.c], positionsArray[3*face.c+1], positionsArray[3*face.c+2]));
            var dist = vertices[0].clone().sub(position).lengthSq();
            var nodeIndex = face.a;
            for (var i=1;i<3;i++){
                var _dist = (vertices[i].clone().sub(position)).lengthSq();
                if (_dist<dist){
                    dist = _dist;
                    if (i==1) nodeIndex = face.b;
                    else nodeIndex = face.c;
                }
            }
            var nodesArray = globals.model.getNodes();
            _highlightedObj = nodesArray[nodeIndex];
        }
        return _highlightedObj;
    } //This code checks for intersections between a given ray and a set of objects in a 3D scene. 
    //If an intersection is found, it determines which face of the object was intersected and 
    //calculates the closest vertex to the intersection point. It then returns the object associated
    // with that vertex as the highlighted object.

    function hideHighlighters(){
        highlighter1.getObject3D().visible = false;
    }
    
    // globals.threeView.sceneAdd(raycasterPlane);

    return {
        hideHighlighters: hideHighlighters
    }

}