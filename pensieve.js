if (Meteor.isClient) {

    Pensieve = {}

    p = Pensieve;
    p.nodes = [];
    p.selected = null;

    p.init = function() {
        var recognition = new webkitSpeechRecognition();
        recognition.onresult = function(event) {
            if (event.results.length > 0) {
                p.newNode(event.results[0][0].transcript);
            }
        }


    }

    p.select = function(body) {
        if (p.selected) {
            p.selected.render.lineWidth = 1
            Body.scale(p.selected, 0.9, 0.9)
        }

        p.selected = body
        p.selected.render.lineWidth = 3
        Body.scale(p.selected, 1.1, 1.1)
    }

    p.delete = function() {
        if (p.selected) {
            Composite.remove(_engine.world, p.selected, true);
        }
    }

    p.fix = function(body) {
        body.isStatic = !body.isStatic
    }

    p.newNode = function(text) {
        var color = p.selected ? p.selected.render.fillStyle : null;
        var origin = p.selected ? p.selected.position : {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2 + 180
        }

        var node = Bodies.circle(origin.x, origin.y, 30, {
            render: {
                fillStyle: color
            }
        });

        node.label = text || "Brilliant idea";

        var bodyA = p.selected || _.findWhere(_engine.world.bodies, {
            label: 'record'
        });


        var edge = Constraint.create({
            bodyA: bodyA,
            bodyB: node,
            length: 150,
            stiffness: 0.02,
            render: {
                strokeStyle: color,
                lineWidth: 1
            }
        });

        World.add(_engine.world, [edge, node])
    }

    function resize(width, height) {
        _engine.world.bounds.max = {
            x: width,
            y: height
        };
        _engine.render.canvas.width = width;
        _engine.render.canvas.height = height;
        _engine.render.canvas.style.width = width + 'px';
        _engine.render.canvas.style.height = height + 'px';
    }

    p.init();

    Template.canvas.rendered = function() {
        var container = document.getElementById('canvas');
        container.width = window.innerWidth;
        container.height = window.innerHeight;

        // some example engine options
        window.mousePos = {}
        $(window).bind('mousemove', function(e) {
            window.mousePos.x = e.pageX;
            window.mousePos.y = e.pageY;
        })

        var options = {
            enableSleeping: false,
            render: {
                options: {
                    background: "#55df98",
                    showIds: true,
                    wireframes: false
                }
            }
        };

        // create a Matter engine
        // NOTE: this is actually Matter.Engine.create(), see the aliases at top of this file
        _engine = Engine.create(container, options);
        _engine.world.gravity.y = -0.5;
        resize(window.innerWidth, window.innerHeight);


        // add a mouse controlled constraint
        _mouseConstraint = MouseConstraint.create(_engine);
        // _mouseConstraint.constraint.render.lineWidth = 0;

        var recordButton = Bodies.circle(window.innerWidth / 2, window.innerHeight / 2 + 180, 32, {
            isStatic: true,
            label: "record",
            render: {
                fillStyle: "transparent",
                strokeStyle: "white",
                lineWidth: 3
            }
        });

        recordButton.label = "record";

        var deleteButton = Bodies.circle(window.innerWidth - 50, window.innerHeight - 50, 35, {
            render: {
                fillStyle: "transparent",
                strokeStyle: "#C03546",
                lineWidth: 3
            },
            isStatic: true,
            label: "delete"
        });

        //Walls
        World.add(_engine.world, [
            Bodies.rectangle(3, 3, 2, window.innerHeight * 2, {
                isStatic: true
            }),
            Bodies.rectangle(3, 3, window.innerWidth * 2, 2, {
                isStatic: true
            }),
            Bodies.rectangle(10, window.innerHeight - 5, window.innerWidth * 2, 2, {
                isStatic: true
            }),
            Bodies.rectangle(window.innerWidth - 5, 10, 2, window.innerHeight * 2, {
                isStatic: true
            })
        ]);

        World.add(_engine.world, [_mouseConstraint, recordButton, deleteButton]);

        Events.on(_engine, 'mouseup', function(event) {
            var mouse = event.mouse;

            // var body = _.findWhere(_engine.world.bodies, {
            //     id: recordButton.id
            // });

            if (Bounds.contains(recordButton.bounds, mouse.position) && Vertices.contains(recordButton.vertices, mouse.position)) {
                console.log("clicked record button")

                p.newNode("Something");
                // recognition.start();
                return
            }

            if (Bounds.contains(deleteButton.bounds, mouse.position) && Vertices.contains(deleteButton.vertices, mouse.position)) {
                console.log("Delete")
                p.delete();
                return
            }

            _.each(_engine.world.bodies, function(body) {
                if (body.id == recordButton.id) return;

                if (Bounds.contains(body.bounds, mouse.position) && Vertices.contains(body.vertices, mouse.position)) {
                    p.select(body)
                }
            });
        });

        // run the engine
        Engine.run(_engine);
        // Demo.initControls();
    };
}

if (Meteor.isServer) {
    Meteor.startup(function() {
        // code to run on server at startup
    });
}
