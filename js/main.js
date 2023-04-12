globals = {};

function setCookie(c_name,value,exdays){var exdate=new Date();exdate.setDate(exdate.getDate() + exdays);var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());document.cookie=c_name + "=" + c_value;}
function getCookie(c_name){var c_value = document.cookie;var c_start = c_value.indexOf(" " + c_name + "=");if (c_start == -1){c_start = c_value.indexOf(c_name + "=");}if (c_start == -1){c_value = null;}else{c_start = c_value.indexOf("=", c_start) + 1;var c_end = c_value.indexOf(";", c_start);if (c_end == -1){c_end = c_value.length;}c_value = unescape(c_value.substring(c_start,c_end));}return c_value;}
function delCookie(name){document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';}

$(function() {

    if (!getCookie('firsttime')){
        if ($("body").innerWidth() > 770) {

            window.setTimeout(function(){

                setCookie('firsttime',true);

                var $helper = $("#helper");
                $helper.show();
                window.setTimeout(function() {
                    $helper.css({opacity: 1});
                    window.setTimeout(function () {
                        $helper.css({opacity: 0});
                        window.setTimeout(function () {
                            $helper.hide();
                        }, 2000);
                    }, 10000);
                    // bounce($helper, 3, 500);
                }, 500);
            }, 7000);
        }

    }

    globals = initGlobals();
    globals.threeView = initThreeView(globals);
    globals.controls = initControls(globals);
    globals.UI3D = init3DUI(globals);
    globals.importer = initImporter(globals);
    globals.model = initModel(globals);
    globals.dynamicSolver = initDynamicSolver(globals);
    globals.pattern = initPattern(globals);
    globals.vive = initViveInterface(globals);
    globals.videoAnimator = initVideoAnimator(globals);

    globals.curvedFolding = initCurvedFolding(globals);//for curved folding

    // Load demo model: waterbomb unless model specified in URL via ?model=FILE
    // where FILE is the data-url attribute of an <a class="demo">.
    var model = 'Tessellations/huffmanWaterbomb.svg';
    var match = /[\\?&]model=([^&#]*)/.exec(location.search);
    if (match) {
        model = match[1];
    }
    model = model.replace(/'/g, ''); // avoid messing up query
    $(".demo[data-url='"+model+"']").click();
});


/**
 * The main module typically includes features for creating, opening, and saving origami models, 
 * as well as for selecting and manipulating various aspects of the model, such as the paper size, 
 * fold angles, and crease patterns. The main module may also include tools for creating custom 
 * crease patterns, testing and verifying the model's accuracy, and exporting the model to other 
 * file formats or applications.
 */