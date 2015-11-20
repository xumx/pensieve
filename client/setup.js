// Matter aliases
Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Common = Matter.Common,
    Constraint = Matter.Constraint,
    RenderPixi = Matter.RenderPixi,
    Events = Matter.Events,
    Bounds = Matter.Bounds,
    Vector = Matter.Vector,
    Vertices = Matter.Vertices,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Query = Matter.Query,

    _engine = null,
    _gui = null,
    _inspector = null,
    _sceneName = null,
    _mouseConstraint = null,
    _sceneEvents = [],
    _useInspector = window.location.hash.indexOf('-inspect') !== -1,
    _isMobile = /(ipad|iphone|ipod|android)/gi.test(navigator.userAgent);


// MatterTools aliases
if (window.MatterTools) {
    Gui = MatterTools.Gui,
        Inspector = MatterTools.Inspector;
}

Demo = {};

Demo.fullscreen = function() {
    var _fullscreenElement = _engine.render.canvas;

    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
        if (_fullscreenElement.requestFullscreen) {
            _fullscreenElement.requestFullscreen();
        } else if (_fullscreenElement.mozRequestFullScreen) {
            _fullscreenElement.mozRequestFullScreen();
        } else if (_fullscreenElement.webkitRequestFullscreen) {
            _fullscreenElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    }
};


Demo.initControls = function() {
    // create a Matter.Gui
    if (!_isMobile && Gui) {
        _gui = Gui.create(_engine);

        // need to add mouse constraint back in after gui clear or load is pressed
        Events.on(_gui, 'clear load', function() {
            _mouseConstraint = MouseConstraint.create(_engine);
            World.add(_engine.world, _mouseConstraint);
        });
    }

    // create a Matter.Inspector
    if (!_isMobile && Inspector && _useInspector) {
        _inspector = Inspector.create(_engine);

        Events.on(_inspector, 'import', function() {
            _mouseConstraint = MouseConstraint.create(_engine);
            World.add(_engine.world, _mouseConstraint);
        });

        Events.on(_inspector, 'play', function() {
            _mouseConstraint = MouseConstraint.create(_engine);
            World.add(_engine.world, _mouseConstraint);
        });

        Events.on(_inspector, 'selectStart', function() {
            _mouseConstraint.constraint.render.visible = false;
        });

        Events.on(_inspector, 'selectEnd', function() {
            _mouseConstraint.constraint.render.visible = true;
        });
    }

    // go fullscreen when using a mobile device
    if (_isMobile) {
        var body = document.body;

        body.className += ' is-mobile';
        _engine.render.canvas.addEventListener('touchstart', Demo.fullscreen);

        var fullscreenChange = function() {
            var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;

            // delay fullscreen styles until fullscreen has finished changing
            setTimeout(function() {
                if (fullscreenEnabled) {
                    body.className += ' is-fullscreen';
                } else {
                    body.className = body.className.replace('is-fullscreen', '');
                }
            }, 2000);
        };

        document.addEventListener('webkitfullscreenchange', fullscreenChange);
        document.addEventListener('mozfullscreenchange', fullscreenChange);
        document.addEventListener('fullscreenchange', fullscreenChange);
    }
};

Demo.reset = function() {
    var _world = _engine.world;

    World.clear(_world);
    Engine.clear(_engine);

    // clear scene graph (if defined in controller)
    var renderController = _engine.render.controller;
    if (renderController.clear)
        renderController.clear(_engine.render);

    // clear all scene events
    for (var i = 0; i < _sceneEvents.length; i++)
        Events.off(_engine, _sceneEvents[i]);
    _sceneEvents = [];

    // reset id pool
    Common._nextId = 0;

    // reset mouse offset and scale (only required for Demo.views)
    Mouse.setScale(_engine.input.mouse, {
        x: 1,
        y: 1
    });
    Mouse.setOffset(_engine.input.mouse, {
        x: 0,
        y: 0
    });

    _engine.enableSleeping = false;
    _engine.world.gravity.y = 1;
    _engine.world.gravity.x = 0;
    _engine.timing.timeScale = 1;

    var offset = 5;
    World.add(_world, [
        Bodies.rectangle(400, -offset, 800.5 + 2 * offset, 50.5, {
            isStatic: true
        }),
        Bodies.rectangle(400, 600 + offset, 800.5 + 2 * offset, 50.5, {
            isStatic: true
        }),
        Bodies.rectangle(800 + offset, 300, 50.5, 600.5 + 2 * offset, {
            isStatic: true
        }),
        Bodies.rectangle(-offset, 300, 50.5, 600.5 + 2 * offset, {
            isStatic: true
        })
    ]);

    _mouseConstraint = MouseConstraint.create(_engine);
    World.add(_world, _mouseConstraint);

    var renderOptions = _engine.render.options;
    renderOptions.wireframes = true;
    renderOptions.hasBounds = false;
    renderOptions.showDebug = false;
    renderOptions.showBroadphase = false;
    renderOptions.showBounds = false;
    renderOptions.showVelocity = false;
    renderOptions.showCollisions = false;
    renderOptions.showAxes = false;
    renderOptions.showPositions = false;
    renderOptions.showAngleIndicator = true;
    renderOptions.showIds = false;
    renderOptions.showShadows = false;
    renderOptions.background = '#fff';

    if (_isMobile)
        renderOptions.showDebug = true;
};